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

// Movie_linkのみによる映画情報取得（Pattern_match無効化版）
async function getMoviesMovieLinkOnly(theaterName, url) {
    try {
        console.log(`\n🎬 ${theaterName} の情報を取得中...`);
        
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 15000
        });
        
        const $ = cheerio.load(response.data);
        
        console.log('📝 Movie_linkのみによる解析を開始...');
        
        // 高信頼度ソース：映画リンクから抽出
        const movieLinkMovies = extractFromMovieLinks($);
        console.log(`🔗 Movie_linkソース: ${movieLinkMovies.length}作品`);
        
        // Pattern_matchを完全に無効化
        console.log('🚫 Pattern_matchを無効化（Movie_linkのみでテスト）');
        
        // Movie_linkのみで重複除去
        const deduplicatedMovies = movieLinkDeduplication(movieLinkMovies);
        
        console.log(`📊 ${theaterName}: ${deduplicatedMovies.length}作品見つかりました（Movie_link重複除去後）`);
        return deduplicatedMovies;
        
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
                    reliability: 100,
                    originalTitle: title,
                    extractionIndex: movies.length
                });
                
                console.log(`🔗 Movie_link: ${cleanTitle} (${movieInfo.year || '年不明'}年, ${movieInfo.duration || '時間不明'}分)`);
            } else if (cleanTitle) {
                console.log(`🚫 UI要素除外: ${cleanTitle}`);
            }
        }
    });
    
    return movies;
}

// 🚀 Movie_link専用重複除去システム
function movieLinkDeduplication(movies) {
    console.log('\n🔄 Movie_link専用重複除去システムを開始...');
    console.log(`入力: ${movies.length}作品`);
    
    const result = [];
    
    // 抽出順序でソート（安定した重複除去のため）
    const sortedMovies = [...movies].sort((a, b) => a.extractionIndex - b.extractionIndex);
    
    for (const movie of sortedMovies) {
        if (shouldKeepMovieStrict(movie, result)) {
            result.push(movie);
            console.log(`✅ 採用: ${movie.title}`);
        } else {
            console.log(`🔄 重複除外: ${movie.title}`);
        }
    }
    
    console.log(`📊 重複除去完了: ${movies.length}作品 → ${result.length}作品`);
    
    return result;
}

// 厳格な重複判定システム（Movie_link専用）
function shouldKeepMovieStrict(newMovie, existingMovies) {
    for (const existing of existingMovies) {
        if (isStrictDuplicate(newMovie, existing)) {
            return false; // 重複発見、除外
        }
    }
    return true; // 重複なし、採用
}

// 厳格重複検出アルゴリズム（上映形式・スペース差異対応）
function isStrictDuplicate(movie1, movie2) {
    // レベル1: 強化正規化完全一致
    const normalized1 = enhancedNormalize(movie1.title);
    const normalized2 = enhancedNormalize(movie2.title);
    
    if (normalized1 === normalized2) {
        return true;
    }
    
    // レベル2: 核心部分抽出一致（上映形式除去）
    const core1 = extractCoreMovieTitle(movie1.title);
    const core2 = extractCoreMovieTitle(movie2.title);
    
    if (core1 && core2 && core1 === core2) {
        return true;
    }
    
    // レベル3: 包含関係検出（字幕・吹き替え対応）
    if (isScreeningFormatDuplicate(movie1.title, movie2.title)) {
        return true;
    }
    
    return false;
}

// 強化正規化（スペース・中点・記号を統一）
function enhancedNormalize(title) {
    if (!title) return '';
    
    return title
        .toLowerCase()                              // 大文字小文字統一
        .replace(/[「」『』【】\[\]（）\(\)]/g, '')    // 括弧類除去
        .replace(/[・：:：\-－　\s]/g, '')            // 区切り記号・全角半角スペース統一除去
        .replace(/[&＆]/g, 'and')                   // アンパサンド統一
        .replace(/[☆★]/g, 'star')                  // 星記号統一
        .replace(/[♪♫]/g, 'music')                 // 音楽記号統一
        .replace(/[！!]/g, 'exclamation')           // 感嘆符統一
        .replace(/[？?]/g, 'question')              // 疑問符統一
        .replace(/[。\.]/g, 'period')               // 句点統一
        .replace(/[#＃]/g, 'hash')                  // ハッシュ統一
        .trim();
}

// 核心映画タイトル抽出（上映形式・UI要素除去）
function extractCoreMovieTitle(title) {
    if (!title) return '';
    
    let core = title;
    
    // 上映形式情報を除去
    core = core.replace(/\s*(字幕版?|吹き?替え?版?|日本語吹替|日本語字幕)\s*/g, '');
    core = core.replace(/\s*(IMAX|4DX|Dolby\s*Cinema|Dolby\s*Atmos|MX4D)\s*/g, '');
    core = core.replace(/\s*(2D|3D|4D)\s*/g, '');
    
    // 劇場版、映画版などの接頭辞は保持（重要な識別子のため）
    // core = core.replace(/^(劇場版|映画版|映画|特別編集版|総集編)\s*/g, '');
    
    // UI要素・時間情報を除去
    core = core.replace(/\s*(作品情報|予告編|公式サイト|レビュー).*$/g, '');
    core = core.replace(/\s*\d{1,2}:\d{2}.*$/g, '');
    core = core.replace(/\s*\d+\.\d+\s*$/g, '');
    core = core.replace(/\s*(コピー|印刷|すべてのスケジュールを見る).*$/g, '');
    
    return enhancedNormalize(core);
}

// 上映形式による重複検出
function isScreeningFormatDuplicate(title1, title2) {
    // 基本タイトル部分を抽出
    const base1 = title1.replace(/\s*(字幕版?|吹き?替え?版?|IMAX|4DX|Dolby|2D|3D|4D).*$/g, '').trim();
    const base2 = title2.replace(/\s*(字幕版?|吹き?替え?版?|IMAX|4DX|Dolby|2D|3D|4D).*$/g, '').trim();
    
    // 正規化して比較
    const norm1 = enhancedNormalize(base1);
    const norm2 = enhancedNormalize(base2);
    
    // 短すぎるタイトルは厳密一致のみ
    if (norm1.length < 3 || norm2.length < 3) {
        return norm1 === norm2;
    }
    
    // 基本タイトルが一致する場合は重複
    return norm1 === norm2;
}

// 最小限のタイトルクリーニング（Movie_link用）
function minimalCleanTitle(title) {
    if (!title) return null;
    
    return title
        .replace(/\s+/g, ' ')                    // 複数スペースを単一に
        .replace(/^[・\s]+|[・\s]+$/g, '')        // 先頭末尾の記号のみ除去
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
async function runMovieLinkOnlyTest() {
    console.log('🚀 Movie_link専用テストを開始...\n');
    console.log('🎯 目標: Pattern_matchなしで正確に36作品を抽出');
    console.log('🏗️ Movie_link専用重複除去アルゴリズム:');
    console.log('   1. 強化正規化による厳密一致検出（スペース・中点統一）');
    console.log('   2. 核心タイトル抽出による上映形式違い検出');
    console.log('   3. 字幕・吹き替え・IMAX等の上映形式統合');
    console.log('   4. Pattern_match完全無効化でクリーンテスト\n');
    
    // T・ジョイ博多から映画情報を取得
    const movies = await getMoviesMovieLinkOnly('T・ジョイ博多', testTheaterUrl);
    
    if (movies.length === 0) {
        console.log('❌ 映画情報を取得できませんでした');
        return;
    }
    
    console.log(`\n📊 最終取得結果: ${movies.length}作品`);
    console.log('=' .repeat(60));
    
    // 正解36作品リスト
    const expectedMovies = [
        '28年後...',
        '君がトクベツ',
        '罪人たち',
        'Mr.ノボカイン',
        'プロット 殺人設計者',
        'アイカツ！メモリアルステージ 輝きのユニットカップ',
        '「鬼滅の刃」特別編集版 柱稽古 開幕編',
        '国宝',
        'フロントライン',
        'ドールハウス',
        'かくかくしかじか',
        'ミッション：インポッシブル ファイナル・レコニング',
        '見える子ちゃん',
        'リライト',
        'リロ＆スティッチ',
        '岸辺露伴は動かない 懺悔室',
        'か「」く「」し「」ご「」と「',
        '劇場版総集編　呪術廻戦　懐玉・玉折',
        '名探偵コナン 隻眼の残像（フラッシュバック）',
        'JUNK WORLD',
        '父と僕の終わらない歌',
        '#真相をお話しします',
        'マインクラフト ザ・ムービー',
        'BADBOYS THE MOVIE',
        'MaXXXine マキシーン',
        '劇場版　うたの☆プリンスさまっ♪ TABOO NIGHT XXXX',
        '神椿市建設中。魔女の娘 Witchling',
        '機動戦士Gundam GQuuuuuuX Beginning',
        '青春イノシシ ATARASHII GAKKO! THE MOVIE',
        '死神遣いの事件帖 終（ファイナル）',
        '田村悠人',
        '「鬼滅の刃」特別編集版 刀鍛冶の里 繋いだ絆編',
        'XIA CONCERT MOVIE：RECREATION キム・ジュンス2024アンコールコンサート',
        'ヒプノシスマイク Division Rap Battle',
        '怪盗クイーンの優雅な休暇（バカンス）',
        'プリンセス・プリンシパル Crown Handler 第4章'
    ];
    
    console.log('\n📋 抽出された映画一覧（Movie_linkのみ）:');
    movies.forEach((movie, index) => {
        console.log(`${(index + 1).toString().padStart(2, '0')}. ${movie.title} (${movie.source})`);
        if (movie.year || movie.duration || movie.rating) {
            console.log(`    ${movie.year || '年不明'}年, ${movie.duration || '時間不明'}分, ${movie.rating || 'レーティング不明'}`);
        }
    });
    
    // 精度評価
    console.log('\n🎯 精度評価:');
    console.log(`期待作品数: ${expectedMovies.length}作品`);
    console.log(`実際抽出数: ${movies.length}作品`);
    
    if (movies.length === expectedMovies.length) {
        console.log('✅ 作品数が一致！');
    } else {
        console.log(`❌ 作品数が不一致 (差分: ${Math.abs(movies.length - expectedMovies.length)}作品)`);
    }
    
    // マッチング評価
    let exactMatches = 0;
    let partialMatches = 0;
    const foundTitles = new Set();
    
    console.log('\n🔍 タイトルマッチング評価:');
    
    for (const expected of expectedMovies) {
        let bestMatch = null;
        let bestSimilarity = 0;
        
        for (const movie of movies) {
            const similarity = calculateTitleSimilarity(expected, movie.title);
            if (similarity > bestSimilarity) {
                bestSimilarity = similarity;
                bestMatch = movie;
            }
        }
        
        if (bestSimilarity >= 0.9) {
            exactMatches++;
            foundTitles.add(bestMatch.title);
            console.log(`✅ 完全マッチ: "${expected}" → "${bestMatch.title}" (${(bestSimilarity * 100).toFixed(1)}%)`);
        } else if (bestSimilarity >= 0.7) {
            partialMatches++;
            foundTitles.add(bestMatch.title);
            console.log(`🔶 部分マッチ: "${expected}" → "${bestMatch.title}" (${(bestSimilarity * 100).toFixed(1)}%)`);
        } else {
            console.log(`❌ 未検出: "${expected}" (最善マッチ: "${bestMatch ? bestMatch.title : 'なし'}" ${(bestSimilarity * 100).toFixed(1)}%)`);
        }
    }
    
    // 余分な映画の検出
    console.log('\n🔍 余分な映画の検出:');
    for (const movie of movies) {
        if (!foundTitles.has(movie.title)) {
            console.log(`⚠️ 余分な映画: "${movie.title}" (${movie.source})`);
        }
    }
    
    // 最終評価
    console.log('\n📊 最終評価:');
    console.log(`完全マッチ: ${exactMatches}/${expectedMovies.length} (${(exactMatches / expectedMovies.length * 100).toFixed(1)}%)`);
    console.log(`部分マッチ: ${partialMatches}/${expectedMovies.length} (${(partialMatches / expectedMovies.length * 100).toFixed(1)}%)`);
    console.log(`総合マッチ率: ${((exactMatches + partialMatches) / expectedMovies.length * 100).toFixed(1)}%`);
    
    const success = (movies.length === expectedMovies.length) && (exactMatches + partialMatches >= expectedMovies.length * 0.95);
    
    if (success) {
        console.log('\n🎉 Movie_link専用システム テスト成功！');
        console.log('✅ 36作品の正確な抽出を達成');
        console.log('✅ Pattern_match無効化でクリーンな結果');
        console.log('✅ 上映形式・字幕吹替の重複除去成功');
    } else {
        console.log('\n⚠️ 改良の余地があります');
        if (movies.length !== expectedMovies.length) {
            console.log('🔧 作品数調整が必要');
        }
        if ((exactMatches + partialMatches) < expectedMovies.length * 0.95) {
            console.log('🔧 タイトルマッチング精度向上が必要');
        }
    }
    
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
    
    console.log('\n🎉 Movie_link専用テスト完了');
    console.log('\n📝 要約:');
    console.log(`- 抽出映画数: ${movies.length}作品`);
    console.log(`- 完全マッチ率: ${(exactMatches / expectedMovies.length * 100).toFixed(1)}%`);
    console.log(`- アルゴリズム: Movie_link専用重複除去システム`);
    console.log(`- Pattern_match: 完全無効化`);
    console.log(`- 上映形式対応: 字幕・吹き替え・IMAX等の統合`);
}

// エラーハンドリング付きで実行
runMovieLinkOnlyTest().catch(error => {
    console.error('❌ テスト実行エラー:', error);
});
