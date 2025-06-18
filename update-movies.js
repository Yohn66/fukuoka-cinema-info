const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// TMDb API設定
const API_KEY = 'df5c87dc00209048997617ac6295efb6';
const BASE_URL = 'https://api.themoviedb.org/3';

// 福岡の映画館情報
const fukuokaTheaterUrls = {
    'T・ジョイ博多': 'https://eiga.com/theater/40/400101/7080/',
    'ユナイテッド・シネマ キャナルシティ': 'https://eiga.com/theater/40/400101/7001/',
    'KBCシネマ': 'https://eiga.com/theater/40/400101/7010/',
    'kino cinema天神': 'https://eiga.com/theater/40/400101/7103/',
    'ユナイテッド・シネマ ふくおかももち': 'https://eiga.com/theater/40/400101/7096/',
    'TOHOシネマズららぽーと福岡': 'https://eiga.com/theater/40/400101/7107/',
    'TOHOシネマズ天神・ソラリア館': 'https://eiga.com/theater/40/400101/7003/'
};

// 取得できなかった映画館を記録
let failedTheaters = [];

// 映画館から上映中映画を取得
async function getMoviesFromTheater(theaterName, url) {
    try {
        console.log(`${theaterName} の情報を取得中...`);
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        });
        
        const $ = cheerio.load(response.data);
        const movies = [];
        
        // 映画タイトルを抽出（映画.comの構造に基づく）
        $('a[href*="/movie/"]').each((index, element) => {
            const titleElement = $(element).find('img').first();
            let title = titleElement.attr('alt') || titleElement.attr('title');
            
            if (!title) {
                title = $(element).text().trim();
            }
            
            if (title && title.length > 0 && !title.includes('映画') && !title.includes('劇場')) {
                // 重複除去とクリーニング
                const cleanTitle = title.replace(/\s+/g, ' ').trim();
                if (!movies.includes(cleanTitle) && cleanTitle.length > 1) {
                    movies.push(cleanTitle);
                }
            }
        });
        
        // 別のセレクターでも試す
        $('.movie-title, .title, h3, h4').each((index, element) => {
            const title = $(element).text().trim();
            if (title && title.length > 1 && !movies.includes(title)) {
                movies.push(title);
            }
        });
        
        console.log(`${theaterName}: ${movies.length}作品見つかりました`);
        return movies;
        
    } catch (error) {
        console.error(`${theaterName} の取得に失敗:`, error.message);
        failedTheaters.push(theaterName);
        return [];
    }
}

// TMDb APIで映画詳細を取得
async function getMovieDetails(title) {
    try {
        // 日本語で検索
        const searchResponse = await axios.get(`${BASE_URL}/search/movie`, {
            params: {
                api_key: API_KEY,
                language: 'ja',
                query: title
            }
        });
        
        if (searchResponse.data.results.length === 0) {
            // 英語でも検索してみる
            const enSearchResponse = await axios.get(`${BASE_URL}/search/movie`, {
                params: {
                    api_key: API_KEY,
                    language: 'en',
                    query: title
                }
            });
            
            if (enSearchResponse.data.results.length === 0) {
                console.log(`映画が見つかりません: ${title}`);
                return null;
            }
            
            const movie = enSearchResponse.data.results[0];
            
            // 詳細情報を日本語で取得
            const detailResponse = await axios.get(`${BASE_URL}/movie/${movie.id}`, {
                params: {
                    api_key: API_KEY,
                    language: 'ja',
                    append_to_response: 'credits,videos'
                }
            });
            
            return detailResponse.data;
        }
        
        const movie = searchResponse.data.results[0];
        
        // 詳細情報を取得
        const detailResponse = await axios.get(`${BASE_URL}/movie/${movie.id}`, {
            params: {
                api_key: API_KEY,
                language: 'ja',
                append_to_response: 'credits,videos'
            }
        });
        
        return detailResponse.data;
        
    } catch (error) {
        console.error(`TMDb API エラー (${title}):`, error.message);
        return null;
    }
}

// 新作判定（15日以内）
function isNewMovie(releaseDate) {
    if (!releaseDate) return false;
    const today = new Date();
    const release = new Date(releaseDate);
    const diffTime = today - release;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 15;
}

// メイン処理
async function updateMovieInformation() {
    console.log('🎬 福岡映画情報の自動更新を開始...');
    
    // 1. 全映画館から映画情報を収集
    const theaterMovies = {};
    
    for (const [theaterName, url] of Object.entries(fukuokaTheaterUrls)) {
        const movies = await getMoviesFromTheater(theaterName, url);
        theaterMovies[theaterName] = movies;
        
        // APIレート制限を避けるため少し待機
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // 2. 映画ごとに上映館をまとめる
    const movieTheaterMap = {};
    
    for (const [theaterName, movies] of Object.entries(theaterMovies)) {
        for (const movie of movies) {
            if (!movieTheaterMap[movie]) {
                movieTheaterMap[movie] = [];
            }
            if (!movieTheaterMap[movie].includes(theaterName)) {
                movieTheaterMap[movie].push(theaterName);
            }
        }
    }
    
    console.log(`\n📊 集計結果: ${Object.keys(movieTheaterMap).length}作品が見つかりました`);
    
    // 3. TMDb APIで詳細情報を取得
    const updatedMovies = {};
    
    for (const [movieTitle, theaters] of Object.entries(movieTheaterMap)) {
        console.log(`\n🔍 "${movieTitle}" の詳細情報を取得中...`);
        
        const movieDetails = await getMovieDetails(movieTitle);
        
        if (movieDetails) {
            // 複数の公開日がある場合は最も古いものを採用
            const releaseDate = movieDetails.release_date;
            
            updatedMovies[movieTitle] = theaters;
            console.log(`✅ 成功: ${theaters.length}館で上映中`);
        } else {
            // 詳細情報が取得できなくても上映館情報は保持
            updatedMovies[movieTitle] = theaters;
            console.log(`⚠️  詳細情報なし: ${theaters.length}館で上映中`);
        }
        
        // APIレート制限を避けるため待機
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // 4. script.jsを更新
    console.log('\n📝 script.js を更新中...');
    
    try {
        const scriptContent = fs.readFileSync('script.js', 'utf8');
        
        // currentMoviesWithTheaters の部分を置換
        const newMoviesObject = JSON.stringify(updatedMovies, null, 4)
            .replace(/^{/, '')
            .replace(/}$/, '')
            .split('\n')
            .map(line => line ? '    ' + line : line)
            .join('\n');
        
        const updatedScript = scriptContent.replace(
            /const currentMoviesWithTheaters = \{[\s\S]*?\};/,
            `const currentMoviesWithTheaters = {\n${newMoviesObject}\n};`
        );
        
        fs.writeFileSync('script.js', updatedScript, 'utf8');
        console.log('✅ script.js の更新完了');
        
    } catch (error) {
        console.error('❌ script.js の更新に失敗:', error.message);
        process.exit(1);
    }
    
    // 5. 結果レポート
    console.log('\n🎉 更新完了レポート:');
    console.log(`📽️  総映画数: ${Object.keys(updatedMovies).length}作品`);
    console.log(`🏛️  対象映画館: ${Object.keys(fukuokaTheaterUrls).length}館`);
    
    if (failedTheaters.length > 0) {
        console.log(`⚠️  取得失敗: ${failedTheaters.join(', ')}`);
        
        // エラー情報をファイルに記録
        const errorInfo = `\n<!-- 最終更新: ${new Date().toLocaleString('ja-JP')} -->\n<!-- 取得できなかった映画館: ${failedTheaters.join(', ')} -->`;
        
        try {
            const indexContent = fs.readFileSync('index.html', 'utf8');
            const updatedIndex = indexContent.replace(
                /<!-- 最終更新:.*?-->/g, ''
            ).replace(
                /<!-- 取得できなかった映画館:.*?-->/g, ''
            ) + errorInfo;
            
            fs.writeFileSync('index.html', updatedIndex, 'utf8');
        } catch (error) {
            console.error('エラー情報の記録に失敗:', error.message);
        }
    }
    
    console.log('\n🚀 自動更新処理が完了しました！');
}

// エラーハンドリング付きで実行
updateMovieInformation().catch(error => {
    console.error('❌ 致命的なエラーが発生しました:', error);
    process.exit(1);
});
