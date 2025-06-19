const axios = require('axios');
const cheerio = require('cheerio');

// TMDb API設定
const API_KEY = 'df5c87dc00209048997617ac6295efb6';
const BASE_URL = 'https://api.themoviedb.org/3';

// テスト用：T・ジョイ博多のみ
const testTheaterUrl = 'https://eiga.com/theater/40/400101/7080/';

// 除去すべきナビゲーション要素の正規表現
const NAVIGATION_PATTERNS = [
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
    /^でっちあげ/,
    /^メガロポリス$/,
    /^なんだこの映画/,
    /^宝島$/,
    /^映画「F1/,
    /生涯ベスト級/,
    /ネタバレ厳禁/,
    /^国内映画ランキング$/,
    /^おすすめ情報$/,
    /^特別企画$/
];

// 映画館から詳細情報付きで映画を取得（完璧版）
async function getMoviesWithDetailsPerfected(theaterName, url) {
    try {
        console.log(`\n🎬 ${theaterName} の情報を取得中...`);
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        const movies = [];
        const foundTitles = new Set(); // 重複除去用
        
        console.log('📝 HTML解析を開始...');
        
        // 方法1: 既存の成功パターン - 映画リンクから基本タイトル取得
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
                const cleanTitle = cleanMovieTitle(title);
                if (cleanTitle && isValidMovieTitle(cleanTitle) && !foundTitles.has(cleanTitle)) {
                    foundTitles.add(cleanTitle);
                    
                    // 周辺情報を探す
                    const movieInfo = extractAdditionalInfo($, $link);
                    
                    movies.push({
                        title: cleanTitle,
                        year: movieInfo.year,
                        duration: movieInfo.duration,
                        genre: movieInfo.genre,
                        rating: movieInfo.rating,
                        releaseDate: movieInfo.releaseDate,
                        source: 'movie_link'
                    });
                    
                    console.log(`✅ 映画発見: ${cleanTitle} (${movieInfo.year || '年不明'}年, ${movieInfo.duration || '時間不明'}分, ${movieInfo.rating || 'レーティング不明'})`);
                }
            }
        });
        
        // 方法2: ページ全体からパターンマッチングで補完（改良版）
        console.log('\n🔍 パターンマッチングで追加情報を探索...');
        const pageText = $.text();
        
        // より柔軟な公開日パターン: "○月○日公開" "○/○公開" "○年○月○日公開"
        const releasePatterns = [
            // パターン1: "5月30日公開175分PG12"
            /([^\n\r]{3,60}?)\s*(\d{1,2})月(\d{1,2})日公開\s*(\d{1,3})分\s*([A-Z0-9+\-]*)/g,
            // パターン2: "2025年5月30日公開175分PG12"
            /([^\n\r]{3,60}?)\s*(\d{4})年(\d{1,2})月(\d{1,2})日公開\s*(\d{1,3})分\s*([A-Z0-9+\-]*)/g,
            // パターン3: より一般的なパターン
            /([^\n\r]{3,60}?)\s*(\d{1,2}\/\d{1,2}|\d{4}\/\d{1,2}\/\d{1,2})公開\s*(\d{1,3})分\s*([A-Z0-9+\-]*)/g
        ];
        
        releasePatterns.forEach((pattern, patternIndex) => {
            let match;
            while ((match = pattern.exec(pageText)) !== null) {
                let potentialTitle, year, month, day, duration, rating, releaseDate;
                
                if (patternIndex === 0) {
                    // パターン1: 月日のみ
                    [_, potentialTitle, month, day, duration, rating] = match;
                    year = '2025'; // 現在上映中なので2025年と仮定
                    releaseDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                } else if (patternIndex === 1) {
                    // パターン2: 年月日
                    [_, potentialTitle, year, month, day, duration, rating] = match;
                    releaseDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
                }
                
                const cleanTitle = cleanMovieTitle(potentialTitle);
                
                if (cleanTitle && isValidMovieTitle(cleanTitle) && !foundTitles.has(cleanTitle)) {
                    foundTitles.add(cleanTitle);
                    
                    movies.push({
                        title: cleanTitle,
                        year: year,
                        duration: parseInt(duration),
                        genre: null,
                        rating: rating || null,
                        releaseDate: releaseDate,
                        source: 'pattern_match_' + (patternIndex + 1)
                    });
                    
                    console.log(`✅ パターンマッチ${patternIndex + 1}: ${cleanTitle} (${year}年${month}月${day}日, ${duration}分, ${rating || 'レーティング不明'})`);
                }
            }
        });
        
        console.log(`📊 ${theaterName}: ${movies.length}作品見つかりました`);
        return movies;
        
    } catch (error) {
        console.error(`❌ ${theaterName} の取得に失敗:`, error.message);
        return [];
    }
}

// 周辺情報を抽出（改良版）
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
    
    // 年度抽出（より柔軟に）
    const yearMatch = searchTexts.match(/(\d{4})年|公開[：:](\d{4})|(\d{4})\/\d{1,2}\/\d{1,2}/);
    if (yearMatch) {
        info.year = yearMatch[1] || yearMatch[2] || yearMatch[3];
    }
    
    // 上映時間抽出
    const durationMatch = searchTexts.match(/(\d{1,3})分/);
    if (durationMatch) {
        info.duration = parseInt(durationMatch[1]);
    }
    
    // 公開日抽出（詳細）
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
    
    // レーティング抽出（より詳細に）
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

// タイトルクリーニング（完璧版）
function cleanMovieTitle(title) {
    if (!title) return null;
    
    return title
        .replace(/\s+/g, ' ')                    // 複数スペースを単一に
        .replace(/[【】\[\]]/g, '')               // 括弧除去
        .replace(/^\s*[「『]|[」』]\s*$/g, '')     // 引用符除去
        .replace(/^[・\s]+|[・\s]+$/g, '')        // 先頭末尾の記号除去
        .replace(/映画情報|作品詳細|予告編|公式サイト/g, '') // 不要テキスト除去
        .replace(/\(\d+年\)|\(\d+分\)/g, '')     // 年度・時間情報除去
        .replace(/字幕版?|吹き?替え?版?/g, '')     // 上映形式除去
        .replace(/^\d+\/\d+[（(][\w\s]+[）)]\s*/, '') // 日付情報除去
        .replace(/コピー|印刷|すべてのスケジュールを見る/g, '') // ナビゲーション除去
        .replace(/^\s*[:\-－＞>]+\s*/, '')       // 先頭の記号除去
        .replace(/\s*[:\-－＜<]+\s*$/, '')       // 末尾の記号除去
        .trim();
}

// 有効な映画タイトルかどうかの判定（強化版）
function isValidMovieTitle(title) {
    if (!title || title.length < 1) return false;
    
    // ナビゲーション要素の除外
    for (const pattern of NAVIGATION_PATTERNS) {
        if (pattern.test(title)) {
            console.log(`🚫 ナビゲーション要素除外: ${title}`);
            return false;
        }
    }
    
    // 不適切なタイトルの除外
    const invalidPatterns = [
        /^\d+$/,                           // 数字のみ
        /^[:\-－\s]+$/,                    // 記号のみ
        /^[a-zA-Z]{1,2}$/,                 // 短い英字のみ
        /映画館|劇場|シネマ|cinema|theater/i, // 映画館関連
        /時間|分|hour|minute/,              // 時間関連
        /料金|価格|料金表/,                // 料金関連
        /アクセス|交通|駐車場/,            // アクセス関連
        /TEL|電話|連絡先/,                 // 連絡先関連
        /営業時間|開館時間/,               // 営業時間関連
        /^コピー$|^印刷$/,                 // UI要素
        /^～\d+$|^\d+～$/,                 // 時間表記
        /^詳細$|^もっと見る$/               // UI要素
    ];
    
    for (const pattern of invalidPatterns) {
        if (pattern.test(title)) {
            console.log(`🚫 無効タイトル除外: ${title}`);
            return false;
        }
    }
    
    // 有効なタイトルの条件
    return title.length >= 1 && title.length <= 100; // 適切な長さ
}

// TMDb APIで映画詳細を取得（改良版は前回と同じ）
async function getMovieDetailsImproved(movieInfo) {
    try {
        console.log(`\n🔍 "${movieInfo.title}" の詳細情報を取得中...`);
        console.log(`   補完情報: ${movieInfo.year || '年不明'}年, ${movieInfo.duration || '時間不明'}分, ${movieInfo.rating || 'レーティング不明'}`);
        if (movieInfo.releaseDate) {
            console.log(`   公開日: ${movieInfo.releaseDate}`);
        }
        
        // 複数の検索戦略を試行
        const searchStrategies = [
            // 戦略1: タイトル + 年度
            movieInfo.year ? { query: movieInfo.title, year: movieInfo.year } : null,
            // 戦略2: タイトルのみ（日本語）
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
                // 最適な候補を選択
                const bestMatch = findBestMatch(movieInfo, searchResponse.data.results);
                
                if (bestMatch) {
                    console.log(`   ✅ 最適候補: "${bestMatch.title}" (${bestMatch.release_date})`);
                    
                    // 詳細情報を取得
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

// 最適なマッチを見つける（改良版）
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
    
    // 最低スコア閾値を40点に設定
    return bestScore >= 40 ? bestMatch : null;
}

// タイトル類似度計算（前回と同じ）
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

// レーベンシュタイン距離（前回と同じ）
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
async function runPerfectedTest() {
    console.log('🚀 完璧版映画情報抽出テストを開始...\n');
    
    // T・ジョイ博多から映画情報を取得
    const movies = await getMoviesWithDetailsPerfected('T・ジョイ博多', testTheaterUrl);
    
    if (movies.length === 0) {
        console.log('❌ 映画情報を取得できませんでした');
        return;
    }
    
    console.log(`\n📊 取得した映画: ${movies.length}作品`);
    console.log('=' .repeat(60));
    
    // 映画一覧表示（検証用）
    console.log('\n📋 取得された映画一覧:');
    movies.forEach((movie, index) => {
        console.log(`${(index + 1).toString().padStart(2, '0')}. ${movie.title} (${movie.year || '年不明'}年, ${movie.duration || '時間不明'}分, ${movie.rating || 'レーティング不明'})`);
        if (movie.releaseDate) {
            console.log(`    公開日: ${movie.releaseDate}`);
        }
    });
    
    // 各映画でTMDb検索テスト（最初の3作品のみ）
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
    
    console.log('\n🎉 完璧版テスト完了');
    console.log('\n📝 要約:');
    console.log(`- 取得映画数: ${movies.length}作品`);
    console.log(`- 抽出方法: 映画リンク + 改良パターンマッチング`);
    console.log(`- 補完情報: 公開年月日, 上映時間, レーティング`);
    console.log(`- 品質向上: ナビゲーション要素除去, タイトルクリーニング強化`);
}

// エラーハンドリング付きで実行
runPerfectedTest().catch(error => {
    console.error('❌ テスト実行エラー:', error);
});
