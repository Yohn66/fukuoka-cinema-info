// TMDb API設定
const API_KEY = 'df5c87dc00209048997617ac6295efb6';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// 福岡の映画館情報（URL付き）
const fukuokaTheaters = {
    'T・ジョイ博多': {
        name: 'T・ジョイ博多',
        url: 'https://tjoy.jp/t-joy_hakata',
        scheduleUrl: 'https://tjoy.jp/t-joy_hakata'
    },
    'ユナイテッド・シネマ キャナルシティ': {
        name: 'ユナイテッド・シネマ キャナルシティ',
        url: 'https://www.unitedcinemas.jp/canalcity/',
        scheduleUrl: 'https://www.unitedcinemas.jp/canalcity/daily.php'
    },
    'KBCシネマ': {
        name: 'KBCシネマ',
        url: 'https://kbc-cinema.com/',
        scheduleUrl: 'https://kbc-cinema.com/'
    },
    'kino cinema天神': {
        name: 'kino cinema天神',
        url: 'https://kinocinema.jp/theater/tenjin/',
        scheduleUrl: 'https://kinocinema.jp/theater/tenjin/'
    },
    'ユナイテッド・シネマ ふくおかももち': {
        name: 'ユナイテッド・シネマ ふくおかももち',
        url: 'https://www.unitedcinemas.jp/fukuokamomochi/',
        scheduleUrl: 'https://www.unitedcinemas.jp/fukuokamomochi/daily.php'
    },
    'TOHOシネマズららぽーと福岡': {
        name: 'TOHOシネマズららぽーと福岡',
        url: 'https://hlo.tohotheater.jp/net/schedule/070/TNITY.do',
        scheduleUrl: 'https://hlo.tohotheater.jp/net/schedule/070/TNITY.do'
    },
    'TOHOシネマズ天神・ソラリア館': {
        name: 'TOHOシネマズ天神・ソラリア館',
        url: 'https://hlo.tohotheater.jp/net/schedule/064/TNITY.do',
        scheduleUrl: 'https://hlo.tohotheater.jp/net/schedule/064/TNITY.do'
    }
};

// 現在上映中の映画と実際の上映館情報
const currentMoviesWithTheaters = {

        "作品": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "国宝": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "作品情報を見る": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "MERCY マーシー AI裁判": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "ランニング・マン": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "ウォーフェア 戦地最前線": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "機動戦士ガンダム 閃光のハサウェイ キルケーの魔女": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "ズートピア2": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "HELP 復讐島": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "恋愛裁判": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "クスノキの番人": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "ファイブ・ナイツ・アット・フレディーズ2": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "栄光のバックホーム": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "アバター ファイヤー・アンド・アッシュ": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "28年後... 白骨の神殿": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "ダウントン・アビー グランドフィナーレ": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "爆弾": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "TOHOシネマズららぽーと福岡"
        ],
        "新解釈・幕末伝": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "アウトローズ": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "チェンソーマン レゼ篇": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "ワーキングマン": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "白蛇：浮生 巡りめぐる運命の赤い糸": [
            "T・ジョイ博多"
        ],
        "YADANG ヤダン": [
            "T・ジョイ博多"
        ],
        "Tokyo Melody Ryuichi Sakamoto": [
            "T・ジョイ博多"
        ],
        "JO1DER SHOW 2025 ‘WHEREVER WE ARE’ IN TOKYO DOME - LIVE FILM": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "ガールズ＆パンツァー もっとらぶらぶ作戦です！ 第2幕": [
            "T・ジョイ博多"
        ],
        "キミとアイドルプリキュア♪LIVE2025 You&I＝We're IDOL PRECURE": [
            "T・ジョイ博多"
        ],
        "コードギアス 反逆のルルーシュIII 皇道": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "注目作品ランキング": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "砂の器": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "五十年目の俺たちの旅": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "注目作品ランキングの続きを見る": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "予告動画": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "作品情報": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "絞り込み": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "近くの映画館": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "近くのエリア": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "都道府県別": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "映画.com注目特集": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "メラニア": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "神の雫 Drops of God": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "“超怪作”が最速配信!!": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "ブゴニア": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "映画.com編集長もドハマり“極限スリラー”": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "国内映画ランキング": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "おすすめ情報": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "特別企画": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "パンダプラン": [
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "TOKYOタクシー": [
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "安楽死特区": [
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "長安のライチ": [
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "ただいまって言える場所": [
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "PROJECT Y": [
            "ユナイテッド・シネマ キャナルシティ",
            "TOHOシネマズららぽーと福岡"
        ],
        "LIVE IN THEATER「BATTLE OF TOKYO うつくしき嘘」": [
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "Nissy Entertainment “Re:10th Anniversary Final” BEST DOME TOUR “The Movie”": [
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "Nissy Documentary Movie “Re:10th Anniversary Final” BEST DOME TOUR": [
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "ヒグマ!!": [
            "KBCシネマ"
        ],
        "喝采": [
            "KBCシネマ"
        ],
        "ストレイト・ストーリー": [
            "KBCシネマ"
        ],
        "トレインスポッティング": [
            "KBCシネマ"
        ],
        "鬼胎（クィテ） 黒い修道女": [
            "KBCシネマ"
        ],
        "汚れた血": [
            "KBCシネマ"
        ],
        "ぼくの名前はラワン": [
            "KBCシネマ"
        ],
        "どうすればよかったか？": [
            "KBCシネマ"
        ],
        "エルジ": [
            "KBCシネマ"
        ],
        "これからの私たち All Shall Be Well": [
            "KBCシネマ"
        ],
        "月が沈むとき": [
            "KBCシネマ"
        ],
        "たしかにあった幻": [
            "kino cinema天神"
        ],
        "マーズ・エクスプレス": [
            "kino cinema天神"
        ],
        "カリギュラ 究極版": [
            "kino cinema天神"
        ],
        "落下の王国 4Kデジタルリマスター": [
            "kino cinema天神"
        ],
        "Black Box Diaries": [
            "kino cinema天神"
        ],
        "とれ！": [
            "kino cinema天神"
        ],
        "旅の終わりのたからもの": [
            "kino cinema天神"
        ],
        "シネマ歌舞伎 歌舞伎NEXT 朧の森に棲む鬼 松也版": [
            "kino cinema天神"
        ],
        "2001年宇宙の旅": [
            "kino cinema天神",
            "TOHOシネマズららぽーと福岡"
        ],
        "てっぺんの向こうにあなたがいる": [
            "kino cinema天神"
        ],
        "マイ・フェア・レディ": [
            "kino cinema天神"
        ],
        "最強王図鑑 The Ultimate Tournament 特別編 テッペン決めようか！": [
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "ほどなく、お別れです": [
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "射鵰英雄伝": [
            "TOHOシネマズららぽーと福岡"
        ],
        "FUKUYAMA MASAHARU LIVE FILM@NAGASAKI 月光 ずっとこの光につながっていたんだ": [
            "TOHOシネマズららぽーと福岡"
        ],
        "シャドウズ・エッジ": [
            "TOHOシネマズららぽーと福岡"
        ],
        "パプリカ": [
            "TOHOシネマズ天神・ソラリア館"
        ]

};

let allMovies = [];
let genres = {};

// ページ読み込み時の初期化
window.onload = function() {
    loadGenres();
    loadCurrentMovies();
};

// ジャンル一覧を読み込み
async function loadGenres() {
    try {
        const response = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=ja`);
        const data = await response.json();
        
        const genreSelect = document.getElementById('genreSelect');
        data.genres.forEach(genre => {
            genres[genre.id] = genre.name;
            const option = document.createElement('option');
            option.value = genre.id;
            option.textContent = genre.name;
            genreSelect.appendChild(option);
        });
    } catch (error) {
        console.error('ジャンル読み込みエラー:', error);
    }
}

// 現在上映中の映画を読み込み
async function loadCurrentMovies() {
    showLoading(true);
    hideError();
    
    try {
        allMovies = [];
        
        for (const [movieTitle, theaterNames] of Object.entries(currentMoviesWithTheaters)) {
            const movieData = await searchMovieByTitle(movieTitle);
            if (movieData) {
                allMovies.push({
                    ...movieData,
                    theaters: theaterNames,
                    isCurrentlyShowing: true
                });
            }
        }
        
        displayMovies(allMovies);
    } catch (error) {
        showError('映画情報の読み込みに失敗しました: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// 映画タイトルで検索
async function searchMovieByTitle(title) {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=ja&query=${encodeURIComponent(title)}`);
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
            const movie = data.results[0];
            
            // 詳細情報を取得
            const detailResponse = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=ja&append_to_response=credits,videos`);
            const detailData = await detailResponse.json();
            
            return detailData;
        }
        return null;
    } catch (error) {
        console.error(`映画検索エラー (${title}):`, error);
        return null;
    }
}

// 複数の映画を検索（福岡上映中優先版）
async function searchMoviesAdvanced(query) {
    try {
        // まず福岡で上映中の映画から検索
        const currentMatches = [];
        for (const [movieTitle, theaterNames] of Object.entries(currentMoviesWithTheaters)) {
            if (movieTitle.toLowerCase().includes(query.toLowerCase()) || 
                query.toLowerCase().includes(movieTitle.toLowerCase())) {
                const movieData = await searchMovieByTitle(movieTitle);
                if (movieData) {
                    currentMatches.push({
                        ...movieData,
                        theaters: theaterNames,
                        isCurrentlyShowing: true
                    });
                }
            }
        }
        
        // 福岡で上映中の映画が見つかった場合はそれを返す
        if (currentMatches.length > 0) {
            return currentMatches;
        }
        
        // 見つからない場合は一般検索
        const response = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=ja&query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        const movies = [];
        
        // 検索結果から上位5件を取得（検索結果であることを明示）
        for (const movie of data.results.slice(0, 5)) {
            try {
                const detailResponse = await fetch(`${BASE_URL}/movie/${movie.id}?api_key=${API_KEY}&language=ja&append_to_response=credits,videos`);
                const detailData = await detailResponse.json();
                movies.push({
                    ...detailData,
                    theaters: ['検索結果'],
                    isCurrentlyShowing: false
                });
            } catch (error) {
                console.error(`詳細取得エラー (${movie.title}):`, error);
            }
        }
        
        return movies;
    } catch (error) {
        console.error('映画検索エラー:', error);
        return [];
    }
}

// 映画を表示
function displayMovies(movies) {
    const grid = document.getElementById('moviesGrid');
    grid.innerHTML = '';
    
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        grid.appendChild(movieCard);
    });
}

// 映画カードを作成
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => showMovieDetail(movie);
    
    const posterUrl = movie.poster_path ? 
        `${IMAGE_BASE_URL}${movie.poster_path}` : 
        'https://via.placeholder.com/500x750/cccccc/666666?text=No+Image';
    
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
    const isNew = isNewMovie(movie.release_date);
    
    // 上映館情報を表示
    let theaterInfo = '';
    if (movie.theaters && movie.theaters.length > 0 && movie.isCurrentlyShowing) {
        theaterInfo = `<div class="movie-theaters">${movie.theaters.length}館で上映中</div>`;
    } else if (movie.theaters && movie.theaters.includes('検索結果')) {
        theaterInfo = '<div class="movie-theaters">検索結果</div>';
    }
    
    card.innerHTML = `
        ${isNew ? '<div class="new-badge">NEW!</div>' : ''}
        <img class="movie-poster" src="${posterUrl}" alt="${movie.title}" onerror="this.src='https://via.placeholder.com/500x750/cccccc/666666?text=No+Image'">
        <div class="movie-info">
            <div class="movie-title">${movie.title}</div>
            <div class="movie-meta">公開: ${releaseYear}年</div>
            <div class="movie-meta">上映時間: ${movie.runtime || '不明'}分</div>
            ${theaterInfo}
        </div>
    `;
    
    return card;
}

// 新作かどうか判定
function isNewMovie(releaseDate) {
    if (!releaseDate) return false;
    const today = new Date();
    const release = new Date(releaseDate);
    const diffTime = today - release;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays <= 15; // 15日以内なら新作
}

// 映画詳細を表示
function showMovieDetail(movie) {
    document.getElementById('detailTitle').textContent = movie.title;
    document.getElementById('detailRelease').textContent = `公開日: ${movie.release_date || '不明'}`;
    document.getElementById('detailOverview').textContent = movie.overview || 'あらすじ情報がありません';
    
    // ポスター
    const posterUrl = movie.poster_path ? 
        `${IMAGE_BASE_URL}${movie.poster_path}` : 
        'https://via.placeholder.com/500x750/cccccc/666666?text=No+Image';
    document.getElementById('detailPoster').src = posterUrl;
    
    // 監督情報
    const director = movie.credits?.crew?.find(person => person.job === 'Director');
    document.getElementById('detailDirector').textContent = `監督: ${director ? director.name : '不明'}`;
    
    // キャスト情報
    const cast = movie.credits?.cast?.slice(0, 5).map(actor => actor.name).join(', ') || '不明';
    document.getElementById('detailCast').textContent = `出演: ${cast}`;
    
    // ジャンル
    const genreNames = movie.genres?.map(g => g.name).join(', ') || '不明';
    document.getElementById('detailGenres').textContent = `ジャンル: ${genreNames}`;
    
    // 上映館情報
    let theaterSection = '';
    if (movie.theaters && movie.theaters.length > 0 && movie.isCurrentlyShowing) {
        theaterSection = '<div class="detail-meta">上映館:<br>';
        movie.theaters.forEach(theaterName => {
            const theater = fukuokaTheaters[theaterName];
            if (theater) {
                theaterSection += `<a href="${theater.scheduleUrl}" target="_blank" style="color: #667eea; text-decoration: none; margin-right: 15px; display: inline-block; margin-top: 5px;">📍 ${theater.name}</a><br>`;
            }
        });
        theaterSection += '</div>';
    } else if (movie.theaters && movie.theaters.includes('検索結果')) {
        theaterSection = '<div class="detail-meta">※検索結果 - 実際の上映状況は各映画館でご確認ください</div>';
    }
    
    // 評価
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : '不明';
    document.getElementById('detailRating').innerHTML = `評価: ${rating}/10<br><br>${theaterSection}`;
    
    // 予告編
    const trailer = movie.videos?.results?.find(video => video.type === 'Trailer' && video.site === 'YouTube');
    const trailerBtn = document.getElementById('detailTrailer');
    if (trailer) {
        trailerBtn.href = `https://www.youtube.com/watch?v=${trailer.key}`;
        trailerBtn.style.display = 'inline-block';
    } else {
        trailerBtn.style.display = 'none';
    }
    
    document.getElementById('movieDetail').style.display = 'block';
}

// 詳細を閉じる
function closeDetail() {
    document.getElementById('movieDetail').style.display = 'none';
}

// 映画検索
async function searchMovie() {
    const query = document.getElementById('movieSearch').value.trim();
    if (!query) return;
    
    showLoading(true);
    hideError();
    
    try {
        // 複数の検索結果を取得
        const movies = await searchMoviesAdvanced(query);
        
        if (movies.length > 0) {
            displayMovies(movies);
            // 検索結果を allMovies に保存（並び替えのため）
            allMovies = movies;
        } else {
            showError(`「${query}」に関連する映画が見つかりませんでした`);
        }
    } catch (error) {
        showError('検索に失敗しました: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Enterキーで検索
document.getElementById('movieSearch').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchMovie();
    }
});

// 並び替え
document.getElementById('sortSelect').addEventListener('change', function() {
    const sortBy = this.value;
    const sortedMovies = [...allMovies].sort((a, b) => {
        switch (sortBy) {
            case 'release_date':
                return new Date(b.release_date || 0) - new Date(a.release_date || 0);
            case 'popularity':
                return (b.popularity || 0) - (a.popularity || 0);
            case 'title':
                return (a.title || '').localeCompare(b.title || '');
            case 'vote_average':
                return (b.vote_average || 0) - (a.vote_average || 0);
            default:
                return 0;
        }
    });
    displayMovies(sortedMovies);
});

// ローディング表示
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

// エラー表示
function showError(message) {
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

function hideError() {
    document.getElementById('error').style.display = 'none';
}

// モーダルの外側クリックで閉じる
document.getElementById('movieDetail').addEventListener('click', function(e) {
    if (e.target === this) {
        closeDetail();
    }
});
