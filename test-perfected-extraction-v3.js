const axios = require('axios');
const cheerio = require('cheerio');

// TMDb API設定
const API_KEY = 'df5c87dc00209048997617ac6295efb6';
const BASE_URL = 'https://api.themoviedb.org/3';

// テスト用：T・ジョイ博多のみ
const testTheaterUrl = 'https://eiga.com/theater/40/400101/7080/';

// ナビゲーション要素の除外パターン（明確なUI要素のみ）
const UI_PATTERNS = [
    /^作品$/,
    /^作品情報$/,
    /作品情報を見る$/,
    /^注目作品ランキング/,
    /^予告動画$/,
    /^絞り込み$/,
    /^近くの映画館$/,
    /^近くのエリア$/,
    /^都道府県別$/,
    /^映画\.com/,
    /^国内映画ランキング$/,
    /^おすすめ情報$/,
    /^特別企画$/,
    /を探す$/,
    /レビュー$/
];

// ソース分離による映画情報取得（根本的解決版）
async function getMoviesWithSourceSeparation(theaterName, url) {
    try {
        console.log(`\n🎬 ${theaterName} の情報を取得中...`);
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        console.log('📝 ソース分離による解析を開始...');
        
        // 1. 高信頼度ソース：映画リンクから抽出
        const highReliabilityMovies = extractFromMovieLinks($);
        console.log(`🔗 高信頼度ソース: ${highReliabilityMovies.length}作品`);
        
        // 2. 低信頼度ソース：パターンマッチングから抽出
        const lowReliabilityMovies = extractFromPatterns($);
        console.log(`🔍 低信頼度ソース: ${lowReliabilityMovies.length}作品`);
        
        // 3. ソース統合（信頼度優先）
        const mergedMovies = mergeMoviesByPriority(highReliabilityMovies, lowReliabilityMovies);
        
        console.log(`📊 ${theaterName}: ${mergedMovies.length}作品見つかりました（統合後）`);
        return mergedMovies;
        
    } catch (error) {
        console.error(`❌ ${theaterName} の取得に失敗:`, error.message);
        return [];
    }
}

// 高信頼度ソース：映画リンクから抽出
function extractFromMovieLinks($) {
    const movies = [];
    
    $('a[href*="/movie/"]').each((index, element) => {
        const $link = $(element);
        
        // タイトル抽出（複数方法を試行）
        let title = null;
        
        // img要素のalt属性から
        const $img = $link.find('img').first();
        if ($img.length > 0) {
            title = $img.attr('alt') || $img.attr('title');
        }
        
        // リンクテキストから
        if (!title || title.trim().length === 0) {
            title = $link.text().trim();
        }
        
        // 親要素のテキストから
        if (!title || title.trim().length === 0) {
            title = $link.parent().text().trim();
        }
        
        if (title && title.length > 0) {
            const cleanTitle = minimalCleanTitle(title);
            
            if (cleanTitle && isNotUIElement(cleanTitle)) {
                // 周辺情報を探す
                const movieInfo = extractAdditionalInfo($, $link);
                
                movies.push({
                    title: cleanTitle,
                    year: movieInfo.year,
                    duration: movieInfo.duration,
                    genre: movieInfo.genre,
                    rating: movieInfo.rating,
                    releaseDate: movieInfo.releaseDate,
                    source: 'movie_link',
                    reliability: 100
                });
                
                console.log(`🔗 高信頼: ${cleanTitle} (${movieInfo.year || '年不明'}年, ${movieInfo.duration || '時間不明'}分)`);
            } else if (cleanTitle) {
                console.log(`🚫 UI要素除外: ${cleanTitle}`);
            }
        }
    });
    
    return movies;
}

// 低信頼度ソース：パターンマッチングから抽出
function extractFromPatterns($) {
    const movies = [];
    const pageText = $.text();
    
    console.log('\n🔍 パターンマッチングで補完情報を探索...');
    
    // 公開日パターン
    const releasePatterns = [
        // パターン1: "5月30日公開175分PG12"
        /([^\n\r]{3,60}?)\s*(\d{1,2})月(\d{1,2})日公開\s*(\d{1,3})分\s*([A-Z0-9+\-]*)/g,
        // パターン2: "2025年5月30日公開175分PG12"
        /([^\n\r]{3,60}?)\s*(\d{4})年(\d{1,2})月(\d{1,2})日公開\s*(\d{1,3})分\s*([A-Z0-9+\-]*)/g
    ];
    
    releasePatterns.forEach((pattern, patternIndex) => {
        let match;
        while ((match = pattern.exec(pageText)) !== null) {
            let potentialTitle, year, month, day, duration, rating, releaseDate;
            
            if (patternIndex === 0) {
                // パターン1: 月日のみ
                [_, potentialTitle, month, day, duration, rating] = match;
                year = '2025';
                releaseDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            } else if (patternIndex === 1) {
                // パターン2: 年月日
                [_, potentialTitle, year, month, day, duration, rating] = match;
                releaseDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
            
            const cleanTitle = aggressiveCleanTitle(potentialTitle);
            
            if (cleanTitle && isNotUIElement(cleanTitle)) {
                movies.push({
                    title: cleanTitle,
                    year: year,
                    duration: parseInt(duration),
                    genre: null,
                    rating: rating || null,
                    releaseDate: releaseDate,
                    source: 'pattern_match',
                    reliability: 50
                });
                
                console.log(`🔍 低信頼: ${cleanTitle} (${year}年${month}月${day}日, ${duration}分)`);
            }
        }
    });
    
    return movies;
}

// 最小限のタイトルクリーニング（高信頼度用）
function minimalCleanTitle(title) {
    if (!title) return null;
    
    return title
        .replace(/\s+/g, ' ')                    // 複数スペースを単一に
        .replace(/^[・\s]+|[・\s]+$/g, '')        // 先頭末尾の記号のみ除去
        .trim();
}

// 攻撃的タイトルクリーニング（低信頼度用）
function aggressiveCleanTitle(title) {
    if (!title) return null;
    
    return title
        .replace(/\s+/g, ' ')                    // 複数スペースを単一に
        .replace(/^[^\w\p{L}]+/, '')             // 先頭の記号・数字・時間情報
        .replace(/[^\w\p{L}]+$/, '')             // 末尾の記号・数字・評価
        .replace(/[【】\[\]]/g, '')               // 括弧除去
        .replace(/^\s*[「『]|[」』]\s*$/g, '')     // 引用符除去
        .replace(/映画情報|作品詳細|予告編|公式サイト/g, '') // 不要テキスト除去
        .replace(/字幕版?|吹き?替え?版?/g, '')     // 上映形式除去
        .trim();
}

// UI要素判定（明確なパターンのみ）
function isNotUIElement(title) {
    for (const pattern of UI_PATTERNS) {
        if (pattern.test(title)) {
            return false;
        }
    }
    
    // 明らかなUI要素の除外
    if (title.length < 1 || title.length > 100) {
        return false;
    }
    
    return true;
}

// 重複除去用の正規化
function normalizeForDeduplication(title) {
    return title
        .replace(/[^\w\p{L}]/g, '')      // 記号・数字・空白を全除去
        .toLowerCase();                  // 大文字小文字統一
}

// ソース統合（信頼度優先）
function mergeMoviesByPriority(highReliability, lowReliability) {
    console.log('\n🔄 ソース統合を開始...');
    
    const result = [...highReliability];
    const usedTitles = new Set();
    
    // 高信頼度ソースの正規化タイトルを記録
    highReliability.forEach(movie => {
        const normalized = normalizeForDeduplication(movie.title);
        usedTitles.add(normalized);
        console.log(`📌 高信頼確保: ${movie.title} → ${normalized}`);
    });
    
    // 低信頼度ソースは重複しない場合のみ追加
    let addedCount = 0;
    lowReliability.forEach(movie => {
        const normalized = normalizeForDeduplication(movie.title);
        
        if (!usedTitles.has(normalized)) {
            result.push(movie);
            usedTitles.add(normalized);
            addedCount++;
            console.log(`✅ 低信頼追加: ${movie.title} → ${normalized}`);
        } else {
            console.log(`🔄 重複除外: ${movie.title} → ${normalized}`);
        }
    });
    
    console.log(`📊 統合結果: 高信頼${highReliability.length}作品 + 低信頼${addedCount}作品 = 合計${result.length}作品`);
    
    return result;
}

// 周辺情報を抽出
function extractAdditionalInfo($, $element) {
    const info = {
        year: null,
        duration: null,
        genre: null,
        rating: null,
        releaseDate: null
    };
    
    // より広範囲で情報を探す
    const $parent = $element.parent();
    const $grandParent = $parent.parent();
    const $container = $element.closest('div, section, article, tr, td').first();
    
    const searchTexts = [
        $element.text(),
        $parent.text(),
        $grandParent.text(),
        $container.text(),
        $container.siblings().text()
    ].join(' ');
    
    // 年度抽出
    const yearMatch = searchTexts.match(/(\d{4})年|公開[：:](\d{4})|(\d{4})\/\d{1,2}\/\d{1,2}/);
    if (yearMatch) {
        info.year = yearMatch[1] || yearMatch[2] || yearMatch[3];
    }
    
    // 上映時間抽出
    const durationMatch = searchTexts.match(/(\d{1,3})分/);
    if (durationMatch) {
        info.duration = parseInt(durationMatch[1]);
    }
    
    // 公開日抽出
    const releaseDateMatch = searchTexts.match(/(\d{4})年(\d{1,2})月(\d{1,2})日|(\d{1,2})月(\d{1,2})日公開/);
    if (releaseDateMatch) {
        if (releaseDateMatch[1]) {
            // 年月日
            const year = releaseDateMatch[1];
            const month = releaseDateMatch[2].padStart(2, '0');
            const day = releaseDateMatch[3].padStart(2, '0');
            info.releaseDate = `${year}-${month}-${day}`;
            info.year = year;
        } else if (releaseDateMatch[4]) {
            // 月日のみ
            const month = releaseDateMatch[4].padStart(2, '0');
            const day = releaseDateMatch[5].padStart(2, '0');
            info.releaseDate = `2025-${month}-${day}`;
            info.year = '2025';
        }
    }
    
    // レーティング抽出
    const ratingMatch = searchTexts.match(/(G|PG12|PG-12|R15\+|R18\+|R15|R18)/);
    if (ratingMatch) {
        info.rating = ratingMatch[1];
    }
    
    // ジャンル抽出
    const genreMatch = searchTexts.match(/(アクション|ドラマ|コメディ|ホラー|SF|アニメ|ドキュメンタリー|サスペンス|ロマンス|ファンタジー|スリラー)/);
    if (genreMatch) {
        info.genre = genreMatch[1];
    }
    
    return info;
}

// TMDb APIで映画詳細を取得
async function getMovieDetailsImproved(movieInfo) {
    try {
        console.log(`\n🔍 "${movieInfo.title}" の詳細情報を取得中...`);
        console.log(`   補完情報: ${movieInfo.year || '年不明'}年, ${movieInfo.duration || '時間不明'}分, ${movieInfo.rating || 'レーティング不明'}`);
        console.log(`   信頼度: ${movieInfo.reliability}点 (${movieInfo.source})`);
        if (movieInfo.releaseDate) {
            console.log(`   公開日: ${movieInfo.releaseDate}`);
        }
        
        const searchStrategies = [
            movieInfo.year ? { query: movieInfo.title, year: movieInfo.year } : null,
            { query: movieInfo.title, language: 'ja' }
        ].filter(Boolean);
        
        for (const strategy of searchStrategies) {
            console.log(`   検索戦略: "${strategy.query}" ${strategy.year ? `(${strategy.year}年)` : ''}`);
            
            const searchResponse = await axios.get(`${BASE_URL}/search/movie`, {
                params: {
                    api_key: API_KEY,
                    language: 'ja',
                    query: strategy.query,
                    year: strategy.year || undefined
                }
            });
            
            console.log(`   検索結果: ${searchResponse.data.results.length}件`);
            
            if (searchResponse.data.results.length > 0) {
                const bestMatch = findBestMatch(movieInfo, searchResponse.data.results);
                
                if (bestMatch) {
                    console.log(`   ✅ 最適候補: "${bestMatch.title}" (${bestMatch.release_date})`);
                    
                    const detailResponse = await axios.get(`${BASE_URL}/movie/${bestMatch.id}`, {
                        params: {
                            api_key: API_KEY,
                            language: 'ja',
                            append_to_response: 'credits,videos'
                        }
                    });
                    
                    return detailResponse.data;
                }
            }
        }
        
        console.log(`   ❌ 適切な候補が見つかりません`);
        return null;
        
    } catch (error) {
        console.error(`   ❌ TMDb API エラー (${movieInfo.title}):`, error.message);
        return null;
    }
}

// 最適なマッチを見つける
function findBestMatch(movieInfo, candidates) {
    let bestScore = 0;
    let bestMatch = null;
    
    console.log(`   📊 ${candidates.length}件の候補を評価中...`);
    
    candidates.forEach((candidate, index) => {
        let score = 0;
        const details = [];
        
        // 1. タイトル類似度（基本スコア 50点）
        const titleSimilarity = calculateTitleSimilarity(movieInfo.title, candidate.title);
        const titleScore = titleSimilarity * 50;
        score += titleScore;
        details.push(`タイトル類似度: ${(titleSimilarity * 100).toFixed(1)}% (${titleScore.toFixed(1)}点)`);
        
        // 2. 年度マッチ（30点）
        if (movieInfo.year && candidate.release_date) {
            const candidateYear = new Date(candidate.release_date).getFullYear();
            if (candidateYear.toString() === movieInfo.year) {
                score += 30;
                details.push(`年度完全一致: ${candidateYear} (30点)`);
            } else if (Math.abs(candidateYear - parseInt(movieInfo.year)) <= 1) {
                score += 15;
                details.push(`年度近似一致: ${candidateYear} (15点)`);
            }
        }
        
        // 3. 上映時間マッチ（20点）
        if (movieInfo.duration && candidate.runtime) {
            const timeDiff = Math.abs(movieInfo.duration - candidate.runtime);
            if (timeDiff <= 5) {
                score += 20;
                details.push(`上映時間一致: ${candidate.runtime}分 (20点)`);
            } else if (timeDiff <= 15) {
                score += 10;
                details.push(`上映時間近似: ${candidate.runtime}分 (10点)`);
            }
        }
        
        // 4. 言語優先（10点）
        if (candidate.original_language === 'ja') {
            score += 10;
            details.push('日本映画 (10点)');
        }
        
        // 5. 公開年優先（5点）
        if (candidate.release_date) {
            const releaseYear = new Date(candidate.release_date).getFullYear();
            if (releaseYear >= 2024) {
                score += 5;
                details.push('新作映画 (5点)');
            }
        }
        
        // 6. 公開日マッチ（ボーナス 15点）
        if (movieInfo.releaseDate && candidate.release_date) {
            if (movieInfo.releaseDate === candidate.release_date) {
                score += 15;
                details.push(`公開日完全一致: ${candidate.release_date} (15点)`);
            }
        }
        
        console.log(`     候補${index + 1}: "${candidate.title}" (${candidate.release_date}) - 総合スコア: ${score.toFixed(1)}点`);
        console.log(`       ${details.join(', ')}`);
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = candidate;
        }
    });
    
    console.log(`     最高スコア: ${bestScore.toFixed(1)}点`);
    
    return bestScore >= 40 ? bestMatch : null;
}

// タイトル類似度計算
function calculateTitleSimilarity(title1, title2) {
    const clean1 = title1.toLowerCase().replace(/[^\w\s]/g, '');
    const clean2 = title2.toLowerCase().replace(/[^\w\s]/g, '');
    
    if (clean1 === clean2) return 1.0;
    if (clean1.includes(clean2) || clean2.includes(clean1)) return 0.8;
    
    const maxLength = Math.max(clean1.length, clean2.length);
    if (maxLength === 0) return 1.0;
    
    const distance = levenshteinDistance(clean1, clean2);
    return Math.max(0, (maxLength - distance) / maxLength);
}

// レーベンシュタイン距離
function levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
        matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
        matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
        for (let j = 1; j <= str1.length; j++) {
            if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1,
                    matrix[i][j - 1] + 1,
                    matrix[i - 1][j] + 1
                );
            }
        }
    }
    
    return matrix[str2.length][str1.length];
}

// メインテスト実行
async function runSourceSeparationTest() {
    console.log('🚀 根本的解決版映画情報抽出テストを開始...\n');
    console.log('🏗️ 根本的解決アプローチ:');
    console.log('   1. ソース分離による信頼度管理');
    console.log('   2. 最小限vs攻撃的クリーニングの使い分け');
    console.log('   3. 信頼度優先の統合システム');
    console.log('   4. 例外ルール排除\n');
    
    // T・ジョイ博多から映画情報を取得
    const movies = await getMoviesWithSourceSeparation('T・ジョイ博多', testTheaterUrl);
    
    if (movies.length === 0) {
        console.log('❌ 映画情報を取得できませんでした');
        return;
    }
    
    console.log(`\n📊 最終取得結果: ${movies.length}作品`);
    console.log('=' .repeat(60));
    
    // 映画一覧表示（信頼度別）
    console.log('\n📋 取得された映画一覧（信頼度別）:');
    
    const highReliabilityMovies = movies.filter(m => m.reliability === 100);
    const lowReliabilityMovies = movies.filter(m => m.reliability === 50);
    
    console.log(`\n🔗 高信頼度ソース（${highReliabilityMovies.length}作品）:`);
    highReliabilityMovies.forEach((movie, index) => {
        console.log(`H${(index + 1).toString().padStart(2, '0')}. ${movie.title} (${movie.year || '年不明'}年, ${movie.duration || '時間不明'}分, ${movie.rating || 'レーティング不明'})`);
        if (movie.releaseDate) {
            console.log(`     公開日: ${movie.releaseDate}`);
        }
    });
    
    console.log(`\n🔍 低信頼度ソース（${lowReliabilityMovies.length}作品）:`);
    lowReliabilityMovies.forEach((movie, index) => {
        console.log(`L${(index + 1).toString().padStart(2, '0')}. ${movie.title} (${movie.year || '年不明'}年, ${movie.duration || '時間不明'}分, ${movie.rating || 'レーティング不明'})`);
        if (movie.releaseDate) {
            console.log(`     公開日: ${movie.releaseDate}`);
        }
    });
    
    // 特定の映画が取得できているかチェック
    console.log('\n🎯 ターゲット映画の取得確認:');
    const targetMovies = [
        '劇場版総集編 呪術廻戦 懐玉・玉折',
        '劇場版 うたの☆プリンスさまっ♪ TABOO NIGHT XXXX',
        '28年後...'
    ];
    
    targetMovies.forEach(target => {
        const found = movies.find(movie => {
            const normalized1 = normalizeForDeduplication(movie.title);
            const normalized2 = normalizeForDeduplication(target);
            return normalized1.includes(normalized2.substring(0, 5)) || 
                   normalized2.includes(normalized1.substring(0, 5)) ||
                   movie.title.includes(target.substring(0, 5));
        });
        
        if (found) {
            console.log(`✅ 発見: "${target}" → "${found.title}" (${found.source}, 信頼度${found.reliability})`);
        } else {
            console.log(`❌ 未発見: "${target}"`);
        }
    });
    
    // TMDb API連携テスト（最初の3作品）
    console.log('\n' + '=' .repeat(60));
    console.log('📡 TMDb API連携テスト（最初の3作品）');
    console.log('=' .repeat(60));
    
    for (const movie of movies.slice(0, 3)) {
        const tmdbData = await getMovieDetailsImproved(movie);
        
        if (tmdbData) {
            console.log(`✅ マッチ成功: ${movie.title} → ${tmdbData.title}`);
            console.log(`   公開日: ${tmdbData.release_date}, 上映時間: ${tmdbData.runtime}分`);
        } else {
            console.log(`❌ マッチ失敗: ${movie.title}`);
        }
        
        console.log('-'.repeat(50));
        
        // API制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 根本的解決版テスト完了');
    console.log('\n📝 要約:');
    console.log(`- 取得映画数: ${movies.length}作品`);
    console.log(`- 高信頼度: ${highReliabilityMovies.length}作品`);
    console.log(`- 低信頼度: ${lowReliabilityMovies.length}作品`);
    console.log(`- アプローチ: ソース分離 + 信頼度優先統合`);
    console.log(`- 期待結果: 例外ルール不要の安定したデータ抽出`);
}

// エラーハンドリング付きで実行
runSourceSeparationTest().catch(error => {
    console.error('❌ テスト実行エラー:', error);
});
