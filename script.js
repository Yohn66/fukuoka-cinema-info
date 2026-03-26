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
        "鬼の花嫁": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
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
        "ストリート・キングダム 自分の音を鳴らせ。": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "90メートル": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "Ryuichi Sakamoto | Trio Tour 2012": [
            "T・ジョイ博多"
        ],
        "2025 INI LIVE [XQUARE - MASTERPIECE] - LIVE FILM": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "プロジェクト・ヘイル・メアリー": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "君が最後に遺した歌": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "木挽町のあだ討ち": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "ほどなく、お別れです": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "ゴールデンカムイ 網走監獄襲撃編": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "私がビーバーになる時": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "スペシャルズ": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "ウィキッド 永遠の約束": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "超かぐや姫！": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "パリに咲くエトワール": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "教場 Requiem": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "国宝": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "マーティ・シュプリーム 世界をつかめ": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "機動戦士ガンダム 閃光のハサウェイ キルケーの魔女": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡"
        ],
        "ワン・バトル・アフター・アナザー": [
            "T・ジョイ博多"
        ],
        "花緑青が明ける日に": [
            "T・ジョイ博多"
        ],
        "ズートピア2": [
            "T・ジョイ博多"
        ],
        "ナンバーワン戦隊ゴジュウジャーVSブンブンジャー": [
            "T・ジョイ博多"
        ],
        "ゲキ×シネ「紅鬼物語」": [
            "T・ジョイ博多"
        ],
        "ギャビーのドールハウス ザ・ムービー": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "ガールズ＆パンツァー もっとらぶらぶ作戦です！ 第3幕": [
            "T・ジョイ博多"
        ],
        "コードギアス 亡国のアキト 第4章「憎しみの記憶から」": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "羊文学ライブフィルム「Hitsujibungaku Asia Tour \"いま、ここ (Right now right here.)\" at 日本武道館」": [
            "T・ジョイ博多"
        ],
        "ヒプノシスマイク Division Rap Battle": [
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
        "全知的な読者の視点から": [
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
        "最愛の人が亡くなった――": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "辛口批評サイトで超高評価！": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "大ヒットした前作を超えて「もっと好き」": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "俺たちのアナコンダ": [
            "T・ジョイ博多",
            "ユナイテッド・シネマ キャナルシティ",
            "KBCシネマ",
            "kino cinema天神",
            "ユナイテッド・シネマ ふくおかももち",
            "TOHOシネマズららぽーと福岡",
            "TOHOシネマズ天神・ソラリア館"
        ],
        "きたぞきたぞ!!みんな大好き“あのジャンル”の超進化系！": [
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
        "夜勤事件 The Convenience Store": [
            "ユナイテッド・シネマ キャナルシティ"
        ],
        "アメリと雨の物語": [
            "ユナイテッド・シネマ キャナルシティ",
            "TOHOシネマズららぽーと福岡"
        ],
        "ENHYPEN [WALK THE LINE SUMMER EDITION] IN CINEMAS": [
            "ユナイテッド・シネマ キャナルシティ",
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "そして彼女たちは": [
            "KBCシネマ"
        ],
        "決断するとき": [
            "KBCシネマ"
        ],
        "秒速5センチメートル（2007）": [
            "KBCシネマ"
        ],
        "蒸発": [
            "KBCシネマ"
        ],
        "エリス＆トム ボサノヴァ名盤誕生秘話": [
            "KBCシネマ"
        ],
        "ひなぎく": [
            "KBCシネマ"
        ],
        "湯徳章 私は誰なのか": [
            "KBCシネマ"
        ],
        "不貞の女": [
            "KBCシネマ"
        ],
        "肉屋（1970）": [
            "KBCシネマ"
        ],
        "ゴーレム": [
            "KBCシネマ"
        ],
        "宇宙戦争 次の世紀": [
            "KBCシネマ"
        ],
        "オビ・オバ 文明の終わり": [
            "KBCシネマ"
        ],
        "ガガ 英雄たちに栄光あれ": [
            "KBCシネマ"
        ],
        "クイーンダム 誕生": [
            "KBCシネマ"
        ],
        "女鹿": [
            "KBCシネマ"
        ],
        "キング・オブ・キングス": [
            "kino cinema天神"
        ],
        "私たちの話し方": [
            "kino cinema天神"
        ],
        "ハウス・オブ・ザ・デビル": [
            "kino cinema天神"
        ],
        "左ききのエレン（3話先行上映）": [
            "kino cinema天神"
        ],
        "METライブビューイング2025-26 ベッリーニ《清教徒》": [
            "kino cinema天神"
        ],
        "ナースコール": [
            "kino cinema天神"
        ],
        "しあわせな選択": [
            "kino cinema天神"
        ],
        "罪人たち": [
            "kino cinema天神"
        ],
        "東京逃避行": [
            "kino cinema天神"
        ],
        "放送禁止 ぼくの3人の妻": [
            "kino cinema天神"
        ],
        "ひゃくえむ。": [
            "kino cinema天神"
        ],
        "14歳の栞": [
            "kino cinema天神"
        ],
        "大きな家": [
            "kino cinema天神"
        ],
        "GEMNIBUS vol.2": [
            "kino cinema天神"
        ],
        "フェザーズ その家に巣食うもの": [
            "ユナイテッド・シネマ ふくおかももち"
        ],
        "チェッカーズ 1988 SCREW TOUR at 東京ドーム 4Kリマスター": [
            "TOHOシネマズららぽーと福岡"
        ],
        "マクロスプラス MOVIE EDITION": [
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
