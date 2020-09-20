require('../../sass/main.scss');

const {
    setSettingStopOnMove, hasSettingStopOnMove,
    getSettingListOnStart, setSettingListOnStart,
    apiKey, appName
} = require('../shared.js');

const t = window.TrelloPowerUp.iframe({
    appKey: apiKey,
    appName: appName
});

const stopOnMoveCheckbox = document.getElementById('stop-on-move');
const moveToListSelect = document.getElementById('move-to-list');

stopOnMoveCheckbox.addEventListener('change', async () => {
    await setSettingStopOnMove(t, stopOnMoveCheckbox.checked);
});

moveToListSelect.addEventListener('change', async () => {
    const newSetting = moveToListSelect.value || null;
    await setSettingListOnStart(t, newSetting);

    if (newSetting !== null) {
        await t.getRestApi().authorize({
            scope: 'write',
            expiration: 'never'
        });
    } else {
        // Flush token when user do not like for cards to be moved
        try {
            await t.getRestApi().clearToken();
        } catch (e) {
            // Ignore exceptions in case no token exists
        }
    }
});

t.render(async () => {
    stopOnMoveCheckbox.checked = (await hasSettingStopOnMove(t));

    const lists = await t.lists('id', 'name');
    const optionsFrag = document.createDocumentFragment();

    if (lists && lists.length > 0) {
        lists.forEach((list) => {
            const option = document.createElement('option');
            option.value = list.id;
            option.innerText = list.name;
            optionsFrag.appendChild(option);
        });
    }
    
    moveToListSelect.appendChild(optionsFrag);

    const listOnStart = await getSettingListOnStart(t);

    if (listOnStart) {
        moveToListSelect.value = listOnStart;
    }
});