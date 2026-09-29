class ViewRenderer {
    renderGameList(items) {
        let cardsMarkup = '';
        for (let i = 0; i < items.length; i++) {
            const truncatedText = items[i].short_description.split(' ').slice(0, 8).join(' ');
            cardsMarkup += `
            <div class="col">
                <div data-game-id="${items[i].id}" class="card h-100 bg-transparent" role="button">
                    <div class="card-body">
                        <figure class="position-relative">
                            <img class="card-img-top object-fit-cover h-100" src="${items[i].thumbnail}" />
                        </figure>
                        <figcaption>
                            <div class="hstack justify-content-between">
                                <h3 class="h6 small">${items[i].title}</h3>
                                <span class="badge text-bg-primary p-2">Free</span>
                            </div>
                            <p class="card-text small text-center opacity-50">
                                ${truncatedText}
                            </p>
                        </figcaption>
                    </div>
                    <footer class="card-footer small hstack justify-content-between">
                        <span class="badge tag-background">${items[i].genre}</span>
                        <span class="badge tag-background">${items[i].platform}</span>
                    </footer>
                </div>
            </div>
            `;
        }
        document.getElementById('itemsContainer').innerHTML = cardsMarkup;
    }

    renderGameInfo(gameData) {
        const infoMarkup = `
        <div class="col-md-4">
            <img src="${gameData.thumbnail}" class="w-100" alt="تفاصيل الصورة" />
        </div>
        <div class="col-md-8">
            <h3>
Title: ${gameData.title}</h3>
            <p>Category: <span class="badge text-bg-info"> ${gameData.genre}</span> </p>
            <p>Platform: <span class="badge text-bg-info"> ${gameData.platform}</span> </p>
            <p>Status <span class="badge text-bg-info"> ${gameData.status}</span> </p>
            <p class="small">${gameData.description}</p>
            <a class="btn btn-outline-warning" target="_blank" href="${gameData.game_url}">show Game</a>
        </div>
        `;
        document.getElementById('panelContent').innerHTML = infoMarkup;
    }
}

class InfoPanelController {
    constructor(gameId, renderer) {
        this.renderer = renderer;
        document.getElementById('closePanel').addEventListener('click', () => {
            document.querySelector('.primary-view').classList.remove('d-none');
            document.querySelector('.info-panel').classList.add('d-none');
        });
        this.loadGameInfo(gameId);
    }

    loadGameInfo(targetId) {
        const spinnerElement = document.querySelector('.spinner-overlay');
        spinnerElement.classList.remove('d-none');

        const requestConfig = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '761b8a3226msh868f0d927cb6ea4p117ef0jsn46d63d281712',
                'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com'
            }
        };

        fetch(`https://free-to-play-games-database.p.rapidapi.com/api/game?id=${targetId}`, requestConfig)
            .then(res => res.json())
            .then(res => this.renderer.renderGameInfo(res))
            .catch(error => console.error(error))
            .finally(() => {
                spinnerElement.classList.add('d-none');
            });
    }
}

class GameCatalog {
    constructor() {
        this.renderer = new ViewRenderer();
        this.loadGamesData('mmorpg');

        document.querySelectorAll('.category-list a').forEach(navLink => {
            navLink.addEventListener('click', (event) => {
                document.querySelector('.category-list .current-tab').classList.remove('current-tab');
                event.target.classList.add('current-tab');
                this.loadGamesData(event.target.dataset.filter);
            });
        });
    }

    async loadGamesData(selectedCategory) {
        const spinnerElement = document.querySelector('.spinner-overlay');
        spinnerElement.classList.remove('d-none');
        
        const requestConfig = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': '761b8a3226msh868f0d927cb6ea4p117ef0jsn46d63d281712',
                'X-RapidAPI-Host': 'free-to-play-games-database.p.rapidapi.com',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        };

        const apiResponse = await fetch(`https://free-to-play-games-database.p.rapidapi.com/api/games?category=${selectedCategory}`, requestConfig);
        const parsedData = await apiResponse.json();

        this.renderer.renderGameList(parsedData);
        this.attachCardListeners();
        spinnerElement.classList.add('d-none');
    }

    attachCardListeners() {
        document.querySelectorAll('.card').forEach(cardElement => {
            cardElement.addEventListener('click', () => {
                const selectedId = cardElement.dataset.gameId;
                this.openInfoPanel(selectedId);
            });
        });
    }

    openInfoPanel(selectedGameId) {
        new InfoPanelController(selectedGameId, this.renderer);
        document.querySelector('.primary-view').classList.add('d-none');
        document.querySelector('.info-panel').classList.remove('d-none');
    }
}

new GameCatalog();