const axios = require('axios');
const cheerio = require('cheerio');

// TMDb API設定
const API_KEY = 'df5c87dc00209048997617ac6295efb6';
const BASE_URL = 'https://api.themoviedb.org/3';

// テスト用：T・ジョイ博多のみ
const testTheaterUrl = 'https://eiga.com/theater/40/400101/7080/';

// 映画館から詳細情報付きで映画を取得
async function getMoviesWithDetails(theaterName, url) {
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
        
        // より詳細な情報抽出
        // 映画.comの構造に基づいてセレクターを調整
        
        // パターン1: 上映スケジュール表から抽出
        $('.schedule-movie, .movie-schedule').each((index, element) => {
            const movieInfo = extractMovieInfo($, element);
            if (movieInfo) {
                movies.push(movieInfo);
                console.log(`✅ 映画発見: ${movieInfo.title} (${movieInfo.year}年, ${movieInfo.duration}分)`);
            }
        });
        
        // パターン2: 映画リストから抽出
        if (movies.length === 0) {
            $('a[href*="/movie/"]').each((index, element) => {
                const movieInfo = extractMovieInfoAlternative($, element);
                if (movieInfo) {
                    movies.push(movieInfo);
                    console.log(`✅ 映画発見: ${movieInfo.title} (${movieInfo.year || '年不明'}年, ${movieInfo.duration || '時間不明'}分)`);
                }
            });
        }
        
        // パターン3: より広範囲なテキスト抽出
        if (movies.length === 0) {
            console.log('⚠️ 標準的な方法で映画が見つからないため、より広範囲で検索中...');
            extractMoviesFromText($, movies);
        }
        
        console.log(`📊 ${theaterName}: ${movies.length}作品見つかりました`);
        return movies;
        
    } catch (error) {
        console.error(`❌ ${theaterName} の取得に失敗:`, error.message);
        return [];
    }
}

// 映画情報抽出（メインパターン）
function extractMovieInfo($, element) {
    const $el = $(element);
    
    // タイトル抽出
    let title = $el.find('.movie-title, .title, h3, h4').text().trim();
    if (!title) {
        title = $el.find('img').attr('alt') || $el.find('img').attr('title') || '';
    }
    if (!title) {
        title = $el.text().trim();
    }
    
    // 年度抽出
    let year = null;
    const yearMatch = $el.text().match(/(\d{4})年|(\d{4})/);
    if (yearMatch) {
        year = yearMatch[1] || yearMatch[2];
    }
    
    // 上映時間抽出
    let duration = null;
    const durationMatch = $el.text().match(/(\d{1,3})分/);
    if (durationMatch) {
        duration = parseInt(durationMatch[1]);
    }
    
    // ジャンル抽出
    let genre = null;
    const genreMatch = $el.text().match(/(アクション|ドラマ|コメディ|ホラー|SF|アニメ|ドキュメンタリー)/);
    if (genreMatch) {
        genre = genreMatch[1];
    }
    
    if (title && title.length > 1 && !title.includes('映画') && !title.includes('劇場')) {
        return {
            title: cleanTitle(title),
            year: year,
            duration: duration,
            genre: genre
        };
    }
    
    return null;
}

// 代替パターンでの映画情報抽出
function extractMovieInfoAlternative($, element) {
    const $el = $(element);
    
    let title = $el.find('img').attr('alt') || $el.find('img').attr('title') || $el.text().trim();
    
    if (title && title.length > 1) {
        return {
            title: cleanTitle(title),
            year: null,
            duration: null,
            genre: null
        };
    }
    
    return null;
}

// テキストベースでの映画抽出
function extractMoviesFromText($, movies) {
    const pageText = $.text();
    
    // 年度パターンで映画を探す
    const yearPatterns = pageText.match(/[^\n]*(\d{4})年[^\n]*(\d{1,3})分[^\n]*/g);
    if (yearPatterns) {
        yearPatterns.forEach(pattern => {
            const titleMatch = pattern.match(/([^0-9\(\)（）]+)(?=\s*\d{4}年)/);
            const yearMatch = pattern.match(/(\d{4})年/);
            const durationMatch = pattern.match(/(\d{1,3})分/);
            
            if (titleMatch && yearMatch) {
                const title = cleanTitle(titleMatch[1]);
                if (title.length > 1) {
                    movies.push({
                        title: title,
                        year: yearMatch[1],
                        duration: durationMatch ? parseInt(durationMatch[1]) : null,
                        genre: null
                    });
                }
            }
        });
    }
}

// タイトルクリーニング
function cleanTitle(title) {
    return title
        .replace(/\s+/g, ' ')
        .replace(/[【】\[\]]/g, '')
        .replace(/^\s*[「『]|[」』]\s*$/g, '')
        .trim();
}

// TMDb APIで映画詳細を取得（改良版）
async function getMovieDetailsImproved(movieInfo) {
    try {
        console.log(`\n🔍 "${movieInfo.title}" の詳細情報を取得中...`);
        
        // 検索クエリを構築
        let searchQuery = movieInfo.title;
        
        // 年度情報があれば含める
        if (movieInfo.year) {
            searchQuery += ` y:${movieInfo.year}`;
        }
        
        console.log(`   検索クエリ: "${searchQuery}"`);
        
        // 日本語で検索
        const searchResponse = await axios.get(`${BASE_URL}/search/movie`, {
            params: {
                api_key: API_KEY,
                language: 'ja',
                query: searchQuery,
                year: movieInfo.year || undefined
            }
        });
        
        console.log(`   検索結果: ${searchResponse.data.results.length}件`);
        
        if (searchResponse.data.results.length === 0) {
            console.log(`   ❌ 検索結果なし`);
            return null;
        }
        
        // 最適な候補を選択
        const bestMatch = findBestMatch(movieInfo, searchResponse.data.results);
        
        if (!bestMatch) {
            console.log(`   ❌ 適切な候補が見つかりません`);
            return null;
        }
        
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
        
    } catch (error) {
        console.error(`   ❌ TMDb API エラー (${movieInfo.title}):`, error.message);
        return null;
    }
}

// 最適なマッチを見つける
function findBestMatch(movieInfo, candidates) {
    let bestScore = 0;
    let bestMatch = null;
    
    candidates.forEach(candidate => {
        let score = 0;
        
        // タイトル類似度（基本スコア）
        score += calculateTitleSimilarity(movieInfo.title, candidate.title) * 50;
        
        // 年度マッチ
        if (movieInfo.year && candidate.release_date) {
            const candidateYear = new Date(candidate.release_date).getFullYear();
            if (candidateYear.toString() === movieInfo.year) {
                score += 30;
            } else if (Math.abs(candidateYear - parseInt(movieInfo.year)) <= 1) {
                score += 15; // 1年差許容
            }
        }
        
        // 上映時間マッチ
        if (movieInfo.duration && candidate.runtime) {
            const timeDiff = Math.abs(movieInfo.duration - candidate.runtime);
            if (timeDiff <= 5) {
                score += 20;
            } else if (timeDiff <= 15) {
                score += 10;
            }
        }
        
        // 日本映画優先
        if (candidate.original_language === 'ja') {
            score += 10;
        }
        
        // 新しい映画優先
        if (candidate.release_date) {
            const releaseYear = new Date(candidate.release_date).getFullYear();
            if (releaseYear >= 2024) {
                score += 5;
            }
        }
        
        console.log(`     候補: "${candidate.title}" (${candidate.release_date}) - スコア: ${score.toFixed(1)}`);
        
        if (score > bestScore) {
            bestScore = score;
            bestMatch = candidate;
        }
    });
    
    console.log(`     最高スコア: ${bestScore.toFixed(1)}`);
    
    // 最低スコア閾値
    return bestScore >= 40 ? bestMatch : null;
}

// タイトル類似度計算
function calculateTitleSimilarity(title1, title2) {
    const clean1 = title1.toLowerCase().replace(/[^\w\s]/g, '');
    const clean2 = title2.toLowerCase().replace(/[^\w\s]/g, '');
    
    if (clean1 === clean2) return 1.0;
    if (clean1.includes(clean2) || clean2.includes(clean1)) return 0.8;
    
    // 簡単なレーベンシュタイン距離ベース
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
async function runTest() {
    console.log('🚀 映画情報抽出テストを開始...\n');
    
    // T・ジョイ博多から映画情報を取得
    const movies = await getMoviesWithDetails('T・ジョイ博多', testTheaterUrl);
    
    if (movies.length === 0) {
        console.log('❌ 映画情報を取得できませんでした');
        return;
    }
    
    console.log(`\n📊 取得した映画: ${movies.length}作品`);
    console.log('=' .repeat(50));
    
    // 各映画でTMDb検索テスト
    for (const movie of movies.slice(0, 5)) { // 最初の5作品のみテスト
        const tmdbData = await getMovieDetailsImproved(movie);
        
        if (tmdbData) {
            console.log(`✅ マッチ成功: ${movie.title} → ${tmdbData.title}`);
        } else {
            console.log(`❌ マッチ失敗: ${movie.title}`);
        }
        
        // API制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n🎉 テスト完了');
}

// エラーハンドリング付きで実行
runTest().catch(error => {
    console.error('❌ テスト実行エラー:', error);
});
