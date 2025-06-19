const axios = require('axios');
const cheerio = require('cheerio');

// TMDb API設定
const API_KEY = 'df5c87dc00209048997617ac6295efb6';
const BASE_URL = 'https://api.themoviedb.org/3';

// テスト用：T・ジョイ博多のみ
const testTheaterUrl = 'https://eiga.com/theater/40/400101/7080/';

// 映画館から詳細情報付きで映画を取得（改良版）
async function getMoviesWithDetailsImproved(theaterName, url) {
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
            
            if (title && title.length > 0 && !title.includes('映画') && !title.includes('劇場')) {
                const cleanTitle = cleanMovieTitle(title);
                if (cleanTitle && !foundTitles.has(cleanTitle)) {
                    foundTitles.add(cleanTitle);
                    
                    // 周辺情報を探す
                    const movieInfo = extractAdditionalInfo($, $link);
                    
                    movies.push({
                        title: cleanTitle,
                        year: movieInfo.year,
                        duration: movieInfo.duration,
                        genre: movieInfo.genre,
                        rating: movieInfo.rating,
                        source: 'movie_link'
                    });
                    
                    console.log(`✅ 映画発見: ${cleanTitle} (${movieInfo.year || '年不明'}年, ${movieInfo.duration || '時間不明'}分)`);
                }
            }
        });
        
        // 方法2: ページ全体からパターンマッチングで補完
        console.log('\n🔍 パターンマッチングで追加情報を探索...');
        const pageText = $.text();
        
        // 公開日パターン: "○月○日公開" の前にあるテキストを映画タイトルとして抽出
        const releasePatterns = pageText.match(/([^\n\r]{1,50})\s*(\d{1,2}月\d{1,2}日公開)\s*(\d{1,3}分)\s*([A-Z0-9+\-]*)/g);
        if (releasePatterns) {
            releasePatterns.forEach(pattern => {
                const match = pattern.match(/([^\n\r]{1,50}?)\s*(\d{1,2})月(\d{1,2})日公開\s*(\d{1,3})分\s*([A-Z0-9+\-]*)/);
                if (match) {
                    const [_, potentialTitle, month, day, duration, rating] = match;
                    const cleanTitle = cleanMovieTitle(potentialTitle);
                    
                    if (cleanTitle && cleanTitle.length > 1 && !foundTitles.has(cleanTitle)) {
                        foundTitles.add(cleanTitle);
                        
                        // 年度は2025年と仮定（現在の上映作品）
                        const year = '2025';
                        
                        movies.push({
                            title: cleanTitle,
                            year: year,
                            duration: parseInt(duration),
                            genre: null,
                            rating: rating || null,
                            source: 'pattern_match'
                        });
                        
                        console.log(`✅ パターンマッチ: ${cleanTitle} (${year}年, ${duration}分, ${rating || 'レーティング不明'})`);
                    }
                }
            });
        }
        
        console.log(`📊 ${theaterName}: ${movies.length}作品見つかりました`);
        return movies;
        
    } catch (error) {
        console.error(`❌ ${theaterName} の取得に失敗:`, error.message);
        return [];
    }
}

// 周辺情報を抽出
function extractAdditionalInfo($, $element) {
    const info = {
        year: null,
        duration: null,
        genre: null,
        rating: null
    };
    
    // 親要素や兄弟要素から情報を探す
    const $parent = $element.parent();
    const $container = $element.closest('div, section, article').first();
    
    const searchTexts = [
        $element.text(),
        $parent.text(),
        $container.text()
    ].join(' ');
    
    // 年度抽出
    const yearMatch = searchTexts.match(/(\d{4})年|(\d{4})/);
    if (yearMatch) {
        info.year = yearMatch[1] || yearMatch[2];
    }
    
    // 上映時間抽出
    const durationMatch = searchTexts.match(/(\d{1,3})分/);
    if (durationMatch) {
        info.duration = parseInt(durationMatch[1]);
    }
    
    // レーティング抽出
    const ratingMatch = searchTexts.match(/(G|PG12|PG-12|R15\+|R18\+)/);
    if (ratingMatch) {
        info.rating = ratingMatch[1];
    }
    
    // ジャンル抽出
    const genreMatch = searchTexts.match(/(アクション|ドラマ|コメディ|ホラー|SF|アニメ|ドキュメンタリー|サスペンス|ロマンス)/);
    if (genreMatch) {
        info.genre = genreMatch[1];
    }
    
    return info;
}

// タイトルクリーニング（強化版）
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
        .trim();
}

// TMDb APIで映画詳細を取得（改良版）
async function getMovieDetailsImproved(movieInfo) {
    try {
        console.log(`\n🔍 "${movieInfo.title}" の詳細情報を取得中...`);
        console.log(`   補完情報: ${movieInfo.year || '年不明'}年, ${movieInfo.duration || '時間不明'}分, ${movieInfo.rating || 'レーティング不明'}`);
        
        // 複数の検索戦略を試行
        const searchStrategies = [
            // 戦略1: タイトル + 年度
            movieInfo.year ? { query: movieInfo.title, year: movieInfo.year } : null,
            // 戦略2: タイトルのみ（日本語）
            { query: movieInfo.title, language: 'ja' },
            // 戦略3: タイトルのみ（英語も含む）
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

// タイトル類似度計算
function calculateTitleSimilarity(title1, title2) {
    const clean1 = title1.toLowerCase().replace(/[^\w\s]/g, '');
    const clean2 = title2.toLowerCase().replace(/[^\w\s]/g, '');
    
    if (clean1 === clean2) return 1.0;
    if (clean1.includes(clean2) || clean2.includes(clean1)) return 0.8;
    
    // レーベンシュタイン距離ベース
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
async function runImprovedTest() {
    console.log('🚀 改良版映画情報抽出テストを開始...\n');
    
    // T・ジョイ博多から映画情報を取得
    const movies = await getMoviesWithDetailsImproved('T・ジョイ博多', testTheaterUrl);
    
    if (movies.length === 0) {
        console.log('❌ 映画情報を取得できませんでした');
        return;
    }
    
    console.log(`\n📊 取得した映画: ${movies.length}作品`);
    console.log('=' .repeat(60));
    
    // 各映画でTMDb検索テスト（最初の3作品のみ）
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
    
    console.log('\n🎉 改良版テスト完了');
    console.log('\n📝 要約:');
    console.log(`- 取得映画数: ${movies.length}作品`);
    console.log(`- 抽出方法: 映画リンク + パターンマッチング`);
    console.log(`- 補完情報: 公開年, 上映時間, レーティング`);
}

// エラーハンドリング付きで実行
runImprovedTest().catch(error => {
    console.error('❌ テスト実行エラー:', error);
});
