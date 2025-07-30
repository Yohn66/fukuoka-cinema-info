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
        "作品情報を見る": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "BTS ARMY：FOREVER WE ARE YOUNG": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "星つなぎのエリオ": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "アンティル・ドーン": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "SEVENTEEN WORLD TOUR [BE THE SUN]": [
            "T・ジョイ博多"
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
        "事故物件ゾク 恐い間取り": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "ファンタスティック4 ファースト・ステップ": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "木の上の軍隊": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "スーパーマン": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "ババンババンバンバンパイア": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "ドールハウス": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "フロントライン": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "リロ＆スティッチ": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "遠井さんは青春したい！「バカとスマホとロマンスと」": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "この夏の星を見る": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "でっちあげ 殺人教師と呼ばれた男": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "ミッション：インポッシブル ファイナル・レコニング": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "名探偵コナン 隻眼の残像（フラッシュバック）": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "LUPIN THE IIIRD THE MOVIE 不死身の血族": [
            "T・ジョイ博多"
        ],
        "BTS MAP OF THE SOUL ON:E": [
            "T・ジョイ博多"
        ],
        "小林さんちのメイドラゴン さみしがりやの竜": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "IMMACULATE 聖なる胎動": [
            "T・ジョイ博多"
        ],
        "JO1 THE MOVIE 「未完成」 Bon Voyage": [
            "T・ジョイ博多",
            "TOHOシネマズららぽーと福岡"
        ],
        "三日葬 サミルチャン": [
            "T・ジョイ博多"
        ],
        "JUNK WORLD": [
            "T・ジョイ博多"
        ],
        "KING OF PRISM Your Endless Call み～んなきらめけ！プリズム☆ツアーズ": [
            "T・ジョイ博多"
        ],
        "ゲキ×シネ「バサラオ」": [
            "T・ジョイ博多"
        ],
        "タカラヅカ・レビュー・シネマ 星組公演「1789 バスティーユの恋人たち」リミテッド上映": [
            "T・ジョイ博多"
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
        "入国審査": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "またピクサーが大傑作つくったんですか…": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "映画界を変える“究極の推し活”がある。": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "ジュラシック・ワールド　復活の大地": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "何だこのむちゃくちゃ“刺さる”映画は!?": [
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
        "この世界の片隅に": [
            "ユナイテッド・シネマ キャナルシティ",
            "kino cinema天神"
        ],
        "海がきこえる": [
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ"
        ],
        "顔を捨てた男": [
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "それいけ！アンパンマン チャポンのヒーロー！": [
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "DROP ドロップ": [
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "BULLET/BULLET 弾丸疾走編": [
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "私たちが光と想うすべて": [
            "KBCシネマ"
        ],
        "黒川の女たち": [
            "KBCシネマ"
        ],
        "「桐島です」": [
            "KBCシネマ"
        ],
        "ハルビン": [
            "KBCシネマ"
        ],
        "私の見た世界": [
            "KBCシネマ"
        ],
        "それでも私は Though I'm His Daughter": [
            "KBCシネマ"
        ],
        "アジアのユニークな国": [
            "KBCシネマ"
        ],
        "太陽（ティダ）の運命": [
            "KBCシネマ"
        ],
        "無名": [
            "KBCシネマ"
        ],
        "我来たり、我見たり、我勝利せり": [
            "KBCシネマ"
        ],
        "長崎 閃光の影で": [
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "教皇選挙": [
            "kino cinema天神"
        ],
        "罪人たち": [
            "kino cinema天神"
        ],
        "逆火": [
            "kino cinema天神"
        ],
        "天使にラブ・ソングを…": [
            "kino cinema天神",
            "TOHOシネマズららぽーと福岡"
        ],
        "トワイライト・ウォリアーズ 決戦！九龍城砦": [
            "kino cinema天神"
        ],
        "クリムト＆THE KISS アート・オン・スクリーン特別編": [
            "kino cinema天神"
        ],
        "ゼンブ・オブ・トーキョー": [
            "kino cinema天神"
        ],
        "シネマ歌舞伎 棒しばり": [
            "kino cinema天神"
        ],
        "夏の砂の上": [
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "スタントマン 武替道": [
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "パウ・パトロール パウ・パーティー in シアター 2025": [
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "ゴジラ": [
            "TOHOシネマズららぽーと福岡"
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
