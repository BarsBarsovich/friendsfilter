VK.init({
    apiId: 7772215
});

const STORAGE_KEY = 'FRIENDS_FILTER';

let savedIds = new Set();

bestFriends = {
    items: []
};

let myFriends = [];

function auth() {
    return new Promise((resolve, reject) => {
        VK.Auth.login(data => {
            if (data.session) {
                resolve();
            } else {
                reject(new Error('Не удалось авторизоваться'));
            }
        }, 2);
    });
}

function callAPI(method, params) {
    params.v = '5.76';

    return new Promise((resolve, reject) => {
        VK.api(method, params, (data) => {
            if (data.error) {
                reject(data.error);
            } else {
                resolve(data.response);
            }
        });
    })
}

(async () => {
    try {
        await auth();
        const [me] = await callAPI('users.get', {name_case: 'gen'});
        const headerInfo = document.querySelector('#headerInfo');
        headerInfo.textContent = `Друзья на странице ${me.first_name} ${me.last_name}`;

        const storage_model = JSON.parse(localStorage.getItem(STORAGE_KEY));
        debugger
        let friends = undefined;
        if (!storage_model) {
            friends = await callAPI('friends.get', { fields: 'city, country, photo_100' });
            myFriends = friends;
        } else {
            // if (!myFriends.items){
                myFriends = {
                    items: storage_model.myFriends.items
                }

            // }
            storage_model.bestFriends.items.forEach(item => bestFriends.items.push(item));
        }

        // friends = await callAPI('friends.get', {fields: 'city, country, photo_100'});
        // myFriends = friends;
        // bestFriends = friends;


        renderFriends();
        renderBestFriendsTemplate()
        addListeners();
    } catch (e) {
        console.log(e);
    }
})();

function addListeners() {
    const friendsInput = document.getElementById('friendsSearch');
    const bestFriendsInput = document.getElementById('friendsSearch');

    friendsInput.addEventListener('change', function (event) {
        setTimeout(() => {
            filterFriends(false, event.target.value)
        }, 1000);


    });

    bestFriendsInput.addEventListener('change', function (event) {
        setTimeout(() => {
            filterFriends(true, event.target.value)
        }, 1000);
    });
}

function addToBestFriend(event){
    event.preventDefault();

    const root = event.target.parentElement.parentElement;
    console.log(root);
    const friendId = root.querySelector('#friendId').value;
    savedIds.add(+friendId);

    const myFilteredFriends = myFriends.items.filter(item => !Array.from(savedIds).includes(item.id));
    const myFilteredBestFriends = myFriends.items.filter(item => Array.from(savedIds).includes(item.id));

    const resultFriends = {
        items: myFilteredFriends
    }

    bestFriends.items = [];
    myFilteredBestFriends.forEach(item=>{
        bestFriends.items.push(item);
    });


    const storage_model = {
        myFriends: {
            items: myFilteredFriends
        },
        bestFriends: {
            items: myFilteredBestFriends
        }

    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storage_model));

    renderFriends(resultFriends);
    renderBestFriendsTemplate();

}

function filterFriends(isBestFriend, value) {
    let filteredFriends = undefined;

    if (isBestFriend) {
        filteredFriends = bestFriends.items.filter(item => item.first_name.toUpperCase().indexOf(value.toUpperCase()) >= 0
            || item.last_name.toUpperCase().indexOf(value.toUpperCase()) >= 0
        );
    } else {
        filteredFriends = myFriends.items.filter(item => item.first_name.toUpperCase().indexOf(value.toUpperCase()) >= 0
            || item.last_name.toUpperCase().indexOf(value.toUpperCase()) >= 0
        );

    }

    if (filteredFriends) {
        const filteredItems = {
            items: filteredFriends
        }

        isBestFriend ? renderBestFriendsTemplate(filteredItems) : renderFriends(filteredItems);
    }
}

function renderBestFriendsTemplate(items) {
    const bestFriendsTemplate = document.querySelector('#user-template').textContent;
    const render = Handlebars.compile(bestFriendsTemplate);

    const htmlBestFriends = render(items || bestFriends);
    const resultsBestFriends = document.querySelector('#bestFriendsList');
    resultsBestFriends.innerHTML = htmlBestFriends;
}

function renderFriends(items) {
    const template = document.querySelector('#user-template').textContent;
    const render = Handlebars.compile(template);
    const html = render(items || myFriends);
    const results = document.querySelector('#results');
    results.innerHTML = html;
}

