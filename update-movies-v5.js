const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');

// TMDb API設定
const API_KEY = 'df5c87dc00209048997617ac6295efb6';
const BASE_URL = 'https://api.themoviedb.org/3';

// 検証モード設定
const VERIFICATION_MODE = process.env.VERIFICATION_MODE === 'true' || process.argv.includes('--verify');
const EXTRACT_ONLY = process.argv.includes('--extract-only');
const MERGE_ONLY = process.argv.includes('--merge-only');

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
let theaterExtractionResults = {}; // 段階1結果保存用

// ナビゲーション要素の除外パターン
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

// 段階1: 各映画館からのデータ抽出（v5アルゴリズム適用）
async function extractMoviesFromTheater(theaterName, url) {
    try {
        if (VERIFICATION_MODE) {
            console.log(`\n🎬 ${theaterName} からのデータ抽出を開始...`);
        }
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        // Movie_linkのみで抽出（v5方式）
        const rawMovies = extractFromMovieLinks($, theaterName);
        
        // 各映画館内で重複除去
        const deduplicatedMovies = movieLinkDeduplication(rawMovies, theaterName);
        
        if (VERIFICATION_MODE) {
            console.log(`📊 ${theaterName}: ${rawMovies.length}作品抽出 → ${deduplicatedMovies.length}作品（重複除去後）`);
            
            // 代表的なタイトルを表示（最初の5作品）
            console.log(`🎭 代表タイトル:`);
            deduplicatedMovies.slice(0, 5).forEach((movie, index) => {
                console.log(`   ${index + 1}. ${movie.title}`);
            });
            
            if (deduplicatedMovies.length > 5) {
                console.log(`   ... 他${deduplicatedMovies.length - 5}作品`);
            }
        }
        
        return deduplicatedMovies;
        
    } catch (error) {
        console.error(`❌ ${theaterName} の取得に失敗:`, error.message);
        failedTheaters.push(theaterName);
        return [];
    }
}

// Movie_linkから映画情報を抽出
function extractFromMovieLinks($, theaterName) {
    const movies = [];
    
    $('a[href*="/movie/"]').each((index, element) => {
        const $link = $(element);
        
        // タイトル抽出
        let title = null;
        
        const $img = $link.find('img').first();
        if ($img.length > 0) {
            title = $img.attr('alt') || $img.attr('title');
        }
        
        if (!title || title.trim().length === 0) {
            title = $link.text().trim();
        }
        
        if (!title || title.trim().length === 0) {
            title = $link.parent().text().trim();
        }
        
        if (title && title.length > 0) {
            const cleanTitle = minimalCleanTitle(title);
            
            if (cleanTitle && isNotUIElement(cleanTitle)) {
                const movieInfo = extractAdditionalInfo($, $link);
                
                movies.push({
                    title: cleanTitle,
                    year: movieInfo.year,
                    duration: movieInfo.duration,
                    genre: movieInfo.genre,
                    rating: movieInfo.rating,
                    releaseDate: movieInfo.releaseDate,
                    theater: theaterName,
                    source: 'movie_link',
                    reliability: 100,
                    originalTitle: title,
                    extractionIndex: movies.length
                });
                
                if (VERIFICATION_MODE && movies.length <= 3) {
                    console.log(`🔗 抽出: ${cleanTitle} (${movieInfo.year || '年不明'}年, ${movieInfo.duration || '時間不明'}分)`);
                }
            }
        }
    });
    
    return movies;
}

// 各映画館内での重複除去（v5方式）
function movieLinkDeduplication(movies, theaterName) {
    if (VERIFICATION_MODE) {
        console.log(`🔄 ${theaterName} 内重複除去開始...`);
    }
    
    const result = [];
    const sortedMovies = [...movies].sort((a, b) => a.extractionIndex - b.extractionIndex);
    
    for (const movie of sortedMovies) {
        if (shouldKeepMovieStrict(movie, result)) {
            result.push(movie);
        } else if (VERIFICATION_MODE) {
            console.log(`🔄 重複除外: ${movie.title}`);
        }
    }
    
    if (VERIFICATION_MODE) {
        console.log(`📊 ${theaterName} 重複除去: ${movies.length}作品 → ${result.length}作品`);
    }
    
    return result;
}

// 厳格な重複判定（v5方式）
function shouldKeepMovieStrict(newMovie, existingMovies) {
    for (const existing of existingMovies) {
        if (isStrictDuplicate(newMovie, existing)) {
            return false;
        }
    }
    return true;
}

// 厳格重複検出アルゴリズム
function isStrictDuplicate(movie1, movie2) {
    // レベル1: 強化正規化完全一致
    const normalized1 = enhancedNormalize(movie1.title);
    const normalized2 = enhancedNormalize(movie2.title);
    
    if (normalized1 === normalized2) {
        return true;
    }
    
    // レベル2: 核心部分抽出一致
    const core1 = extractCoreMovieTitle(movie1.title);
    const core2 = extractCoreMovieTitle(movie2.title);
    
    if (core1 && core2 && core1 === core2) {
        return true;
    }
    
    // レベル3: 包含関係検出（上映形式対応）
    if (isScreeningFormatDuplicate(movie1.title, movie2.title)) {
        return true;
    }
    
    return false;
}

// 強化正規化（スペース・中点・記号を統一）
function enhancedNormalize(title) {
    if (!title) return '';
    
    return title
        .toLowerCase()
        .replace(/[「」『』【】\[\]（）\(\)]/g, '')
        .replace(/[・：:：\-－　\s]/g, '')
        .replace(/[&＆]/g, 'and')
        .replace(/[☆★]/g, 'star')
        .replace(/[♪♫]/g, 'music')
        .replace(/[！!]/g, 'exclamation')
        .replace(/[？?]/g, 'question')
        .replace(/[。\.]/g, 'period')
        .replace(/[#＃]/g, 'hash')
        .trim();
}

// 核心映画タイトル抽出
function extractCoreMovieTitle(title) {
    if (!title) return '';
    
    let core = title;
    
    // 上映形式情報を除去
    core = core.replace(/\s*(字幕版?|吹き?替え?版?|日本語吹替|日本語字幕)\s*/g, '');
    core = core.replace(/\s*(IMAX|4DX|Dolby\s*Cinema|Dolby\s*Atmos|MX4D)\s*/g, '');
    core = core.replace(/\s*(2D|3D|4D)\s*/g, '');
    
    // UI要素・時間情報を除去
    core = core.replace(/\s*(作品情報|予告編|公式サイト|レビュー).*$/g, '');
    core = core.replace(/\s*\d{1,2}:\d{2}.*$/g, '');
    core = core.replace(/\s*\d+\.\d+\s*$/g, '');
    core = core.replace(/\s*(コピー|印刷|すべてのスケジュールを見る).*$/g, '');
    
    return enhancedNormalize(core);
}

// 上映形式による重複検出
function isScreeningFormatDuplicate(title1, title2) {
    const base1 = title1.replace(/\s*(字幕版?|吹き?替え?版?|IMAX|4DX|Dolby|2D|3D|4D).*$/g, '').trim();
    const base2 = title2.replace(/\s*(字幕版?|吹き?替え?版?|IMAX|4DX|Dolby|2D|3D|4D).*$/g, '').trim();
    
    const norm1 = enhancedNormalize(base1);
    const norm2 = enhancedNormalize(base2);
    
    if (norm1.length < 3 || norm2.length < 3) {
        return norm1 === norm2;
    }
    
    return norm1 === norm2;
}

// 段階2: 映画館間での統合処理
function mergeTheaterMovies(theaterResults) {
    console.log('\n🔄 映画館間統合処理を開始...');
    
    const movieTheaterMap = {};
    let totalMoviesBeforeMerge = 0;
    
    // 全映画館の映画を収集
    for (const [theaterName, movies] of Object.entries(theaterResults)) {
        totalMoviesBeforeMerge += movies.length;
        
        for (const movie of movies) {
            // 統合キーを生成（正規化したタイトル）
            const mergeKey = enhancedNormalize(movie.title);
            
            if (!movieTheaterMap[mergeKey]) {
                movieTheaterMap[mergeKey] = {
                    title: movie.title, // 最初に見つかったタイトルを採用
                    theaters: [],
                    movieData: movie // 詳細情報
                };
            }
            
            // 映画館を追加（重複チェック）
            if (!movieTheaterMap[mergeKey].theaters.includes(theaterName)) {
                movieTheaterMap[mergeKey].theaters.push(theaterName);
            }
        }
    }
    
    if (VERIFICATION_MODE) {
        console.log(`📊 統合前: ${totalMoviesBeforeMerge}作品（全館合計）`);
        console.log(`📊 統合後: ${Object.keys(movieTheaterMap).length}作品（重複除去後）`);
        
        // 複数館上映の映画を表示
        console.log('\n🎭 複数館上映映画（上位10作品）:');
        const multiTheaterMovies = Object.values(movieTheaterMap)
            .filter(movie => movie.theaters.length > 1)
            .sort((a, b) => b.theaters.length - a.theaters.length)
            .slice(0, 10);
            
        multiTheaterMovies.forEach((movie, index) => {
            console.log(`${index + 1}. "${movie.title}" → ${movie.theaters.length}館`);
            console.log(`   [${movie.theaters.join(', ')}]`);
        });
        
        // 単館上映の映画数も表示
        const singleTheaterCount = Object.values(movieTheaterMap)
            .filter(movie => movie.theaters.length === 1).length;
        console.log(`\n📍 単館上映: ${singleTheaterCount}作品`);
        console.log(`📍 複数館上映: ${multiTheaterMovies.length}作品`);
    }
    
    // currentMoviesWithTheaters形式に変換
    const result = {};
    for (const movie of Object.values(movieTheaterMap)) {
        result[movie.title] = movie.theaters;
    }
    
    return result;
}

// ユーティリティ関数群
function minimalCleanTitle(title) {
    if (!title) return null;
    
    return title
        .replace(/\s+/g, ' ')
        .replace(/^[・\s]+|[・\s]+$/g, '')
        .trim();
}

function isNotUIElement(title) {
    for (const pattern of UI_PATTERNS) {
        if (pattern.test(title)) {
            return false;
        }
    }
    
    if (title.length < 1 || title.length > 100) {
        return false;
    }
    
    return true;
}

function extractAdditionalInfo($, $element) {
    const info = {
        year: null,
        duration: null,
        genre: null,
        rating: null,
        releaseDate: null
    };
    
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
            const year = releaseDateMatch[1];
            const month = releaseDateMatch[2].padStart(2, '0');
            const day = releaseDateMatch[3].padStart(2, '0');
            info.releaseDate = `${year}-${month}-${day}`;
            info.year = year;
        } else if (releaseDateMatch[4]) {
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

// メイン処理
async function updateMovieInformation() {
    console.log('🎬 福岡映画情報の自動更新を開始...');
    
    if (VERIFICATION_MODE) {
        console.log('🔍 検証モード: 詳細ログを出力します');
        if (EXTRACT_ONLY) console.log('📤 抽出のみ実行');
        if (MERGE_ONLY) console.log('🔄 統合のみ実行');
    }
    
    let theaterResults = {};
    
    // 段階1: データ抽出
    if (!MERGE_ONLY) {
        console.log('\n📤 段階1: 各映画館からのデータ抽出');
        console.log('=' .repeat(50));
        
        for (const [theaterName, url] of Object.entries(fukuokaTheaterUrls)) {
            const movies = await extractMoviesFromTheater(theaterName, url);
            theaterResults[theaterName] = movies;
            
            // APIレート制限を避けるため少し待機
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        // 段階1の結果サマリー
        console.log('\n📊 段階1 完了サマリー:');
        for (const [theaterName, movies] of Object.entries(theaterResults)) {
            console.log(`${theaterName}: ${movies.length}作品`);
        }
        
        if (EXTRACT_ONLY) {
            console.log('\n✅ データ抽出のみ完了しました');
            return;
        }
        
        // 抽出結果を保存（MERGE_ONLYの場合に使用）
        theaterExtractionResults = theaterResults;
    } else {
        // MERGE_ONLYの場合、保存された結果を使用（実際には前回の結果が必要）
        console.log('📁 保存されたデータ抽出結果を使用します');
        // 実装注意: 実際にはファイルから読み込む必要がある
        theaterResults = theaterExtractionResults;
    }
    
    // 段階2: 映画館間統合
    console.log('\n🔄 段階2: 映画館間統合処理');
    console.log('=' .repeat(50));
    
    const updatedMovies = mergeTheaterMovies(theaterResults);
    
    // 段階3: script.js更新
    if (!VERIFICATION_MODE) {
        console.log('\n📝 script.js を更新中...');
        
        try {
            const scriptContent = fs.readFileSync('script.js', 'utf8');
            
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
    }
    
    // 最終結果レポート
    console.log('\n🎉 更新完了レポート:');
    console.log(`📽️  総映画数: ${Object.keys(updatedMovies).length}作品`);
    console.log(`🏛️  対象映画館: ${Object.keys(fukuokaTheaterUrls).length}館`);
    
    if (failedTheaters.length > 0) {
        console.log(`⚠️  取得失敗: ${failedTheaters.join(', ')}`);
    }
    
    if (VERIFICATION_MODE) {
        console.log('\n📊 最終統合結果の詳細:');
        const movieEntries = Object.entries(updatedMovies);
        
        console.log(`\n🎭 全映画リスト（最初の10作品）:`);
        movieEntries.slice(0, 10).forEach(([title, theaters], index) => {
            console.log(`${index + 1}. "${title}" → ${theaters.length}館`);
            console.log(`   [${theaters.join(', ')}]`);
        });
        
        if (movieEntries.length > 10) {
            console.log(`... 他${movieEntries.length - 10}作品`);
        }
    }
    
    console.log('\n🚀 自動更新処理が完了しました！');
}

// エラーハンドリング付きで実行
updateMovieInformation().catch(error => {
    console.error('❌ 致命的なエラーが発生しました:', error);
    process.exit(1);
});
