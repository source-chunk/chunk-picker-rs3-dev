importScripts('https://cdn.jsdelivr.net/npm/lodash@4.17.10/lodash.min.js');
let nonValids = {};
let globalValids;
let eGlobal;
let highestOverall = {};
let dropRatesGlobal = {};

let type;
let chunks;
let baseChunkData;
let rules;
let chunkInfo;
let skillNames;
let processingSkill;
let maybePrimary;
let combatSkills;
let monstersPlus;
let objectsPlus;
let chunksPlus;
let itemsPlus;
let mixPlus;
let npcsPlus;
let tools;
let elementalRunes;
let manualTasks;
let completeChallenges;
let backlog;
let rareDropNum;
let universalPrimary;
let elementalStaves;
let rangedItems;
let boneItems;
let highestCurrent;
let dropTables;
let questPointTotal;
let randomLoot;
let magicTools;
let bossLogs;
let bossMonsters;
let minigameShops;
let manualEquipment;
let checkedChallenges;

onmessage = function(e) {
    eGlobal = e;
    type = eGlobal.data[0];
    chunks = eGlobal.data[1];
    rules = eGlobal.data[2];
    chunkInfo = eGlobal.data[3];
    skillNames = eGlobal.data[4];
    processingSkill = eGlobal.data[5];
    maybePrimary = eGlobal.data[6];
    combatSkills = eGlobal.data[7];
    monstersPlus = eGlobal.data[8];
    objectsPlus = eGlobal.data[9];
    chunksPlus = eGlobal.data[10];
    itemsPlus = eGlobal.data[11];
    mixPlus = eGlobal.data[12];
    npcsPlus = eGlobal.data[13];
    tools = eGlobal.data[14];
    elementalRunes = eGlobal.data[15];
    manualTasks = eGlobal.data[16];
    completedChallenges = eGlobal.data[17];
    backlog = eGlobal.data[18];
    rareDropNum = eGlobal.data[19];
    universalPrimary = eGlobal.data[20];
    elementalStaves = eGlobal.data[21];
    rangedItems = eGlobal.data[22];
    boneItems = eGlobal.data[23];
    highestCurrent = eGlobal.data[24];
    dropTables = eGlobal.data[25];
    possibleAreas = eGlobal.data[26];
    randomLoot = eGlobal.data[27];
    magicTools = eGlobal.data[28];
    bossLogs = eGlobal.data[29];
    bossMonsters = eGlobal.data[30];
    minigameShops = eGlobal.data[31];
    manualEquipment = eGlobal.data[32];
    checkedChallenges = eGlobal.data[33];

    if (rareDropNum === "1/0") {
        rareDropNum = "1/999999999999999";
    }

    type === 'current' && (chunks = getChunkAreas(chunks));
    baseChunkData = gatherChunksInfo(chunks);
    globalValids = calcChallenges(chunks, baseChunkData);
    calcBIS();
    //console.log(globalValids);

    let tempChallengeArr;
    type === 'current' && (tempChallengeArr = calcCurrentChallenges2());

    //console.log(nonValids);

    postMessage([type, globalValids, baseChunkData, chunkInfo, highestCurrent, tempChallengeArr, type === 'current' ? questPointTotal : 0, highestOverall]);
}

// Calculates all the possible challenges
var calcChallenges = function(chunks, baseChunkData) {
    let valids = calcChallengesWork(chunks, baseChunkData);
    Object.keys(manualTasks).forEach(skill => {
        Object.keys(manualTasks[skill]).forEach(challenge => {
            if (!valids[skill]) {
                valids[skill] = {};
            }
            valids[skill][challenge] = manualTasks[skill][challenge];
        });
    });
    let outputs = {};
    let outputObjects = {};
    let newValids = valids;
    let i = 0;

    do {
        i++;
        valids = newValids;
        let tempChallenges = JSON.parse(JSON.stringify(valids));
        Object.keys(extraOutputItems).forEach(skill => {
            Object.keys(extraOutputItems[skill]).forEach(challenge => {
                if (!tempChallenges[skill]) {
                    tempChallenges[skill] = {};
                }
                if (!tempChallenges[skill][challenge]) {
                    tempChallenges[skill][challenge] = extraOutputItems[skill][challenge];
                }
            });
        });
        Object.keys(tempChallenges).forEach(skill => {
            checkPrimaryMethod(skill, tempChallenges, baseChunkData) && Object.keys(tempChallenges[skill]).forEach(challenge => {
                if (skill !== 'Extra' && skill !== 'BiS') {
                    if (!!chunkInfo['challenges'][skill][challenge]['Output'] && (!backlog[skill] || !backlog[skill].hasOwnProperty(challenge))) {
                        let output = chunkInfo['challenges'][skill][challenge]['Output'];
                        !!chunkInfo['skillItems'][skill] && !!chunkInfo['skillItems'][skill][output] && Object.keys(chunkInfo['skillItems'][skill][output]).forEach(item => {
                            if ((rules['Rare Drop'] || isNaN(parseFloat(chunkInfo['skillItems'][skill][output][item].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['skillItems'][skill][output][item].split('/')[1])) || (parseFloat(chunkInfo['skillItems'][skill][output][item].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['skillItems'][skill][output][item].split('/')[1])) > (parseFloat(rareDropNum.split('/')[0].replaceAll('~', '')) / parseFloat(rareDropNum.split('/')[1]))) &&
                                (rules['Boss'] || !bossLogs.hasOwnProperty(output))) {
                                if (!outputs[item.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')]) {
                                    outputs[item.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')] = {};
                                }
                                if (chunkInfo['challenges'][skill][challenge].hasOwnProperty('Source')) {
                                    if (chunkInfo['challenges'][skill][challenge]['Source'] === 'shop') {
                                        outputs[item.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')][challenge] = chunkInfo['challenges'][skill][challenge]['Source'];
                                    } else if (chunkInfo['skillItems'][skill][output][item] === 'Always' && !chunkInfo['challenges'][skill][challenge]['Secondary']) {
                                        outputs[item.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')][challenge] = 'primary-' + chunkInfo['challenges'][skill][challenge]['Source'];
                                    } else {
                                        outputs[item.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')][challenge] = 'secondary-' + chunkInfo['challenges'][skill][challenge]['Source'];
                                    }
                                } else if (chunkInfo['skillItems'][skill][output][item] === 'Always' && !chunkInfo['challenges'][skill][challenge]['Secondary']) {
                                    outputs[item.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')][challenge] = 'primary-' + skill;
                                } else {
                                    outputs[item.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')][challenge] = 'secondary-' + skill;
                                }
                            }
                        });
                        if (!chunkInfo['skillItems'][skill] || !chunkInfo['skillItems'][skill][output]) {
                            if (!outputs[output.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')]) {
                                outputs[output.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')] = {};
                            }
                            if (chunkInfo['challenges'][skill][challenge].hasOwnProperty('Source')) {
                                if (chunkInfo['challenges'][skill][challenge]['Source'] === 'shop') {
                                    outputs[output.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')][challenge] = chunkInfo['challenges'][skill][challenge]['Source'];
                                } else if (!chunkInfo['challenges'][skill][challenge]['Secondary']) {
                                    outputs[output.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')][challenge] = 'primary-' + chunkInfo['challenges'][skill][challenge]['Source'];
                                } else {
                                    outputs[output.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')][challenge] = 'secondary-' + chunkInfo['challenges'][skill][challenge]['Source'];
                                }
                            } else if (!chunkInfo['challenges'][skill][challenge]['Secondary']) {
                                outputs[output.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')][challenge] = 'primary-' + skill;
                            } else {
                                outputs[output.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')][challenge] = 'secondary-' + skill;
                            }
                        }
                    }
                    if (!!chunkInfo['challenges'][skill][challenge]['Output Object'] && (!backlog[skill] || !backlog[skill].hasOwnProperty(challenge))) {
                        let outputObject = chunkInfo['challenges'][skill][challenge]['Output Object'];
                        if (!outputObjects[outputObject.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')]) {
                            outputObjects[outputObject.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')] = {};
                        }
                        if (!chunkInfo['challenges'][skill][challenge]['Secondary']) {
                            outputObjects[outputObject.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')][challenge] = true;
                        } else {
                            outputObjects[outputObject.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')]['Secondary-' + challenge] = true;
                        }
                    }
                }
            });
        });
        Object.keys(outputs).forEach(output => {
            if (!baseChunkData['items'][output]) {
                baseChunkData['items'][output] = {};
            }
            Object.keys(outputs[output]).forEach(source => {
                baseChunkData['items'][output][source] = outputs[output][source];
            });
        });
        Object.keys(outputObjects).forEach(output => {
            if (!baseChunkData['objects'][output]) {
                baseChunkData['objects'][output] = {};
            }
            Object.keys(outputObjects[output]).forEach(source => {
                baseChunkData['objects'][output][source] = outputObjects[output][source];
            });
        });
        questPointTotal = 0;
        !!valids && !!valids['Quest'] && Object.keys(valids['Quest']).forEach(line => {
            if (!!chunkInfo['challenges']['Quest'][line] && chunkInfo['challenges']['Quest'][line].hasOwnProperty('QuestPoints')) {
                questPointTotal += chunkInfo['challenges']['Quest'][line]['QuestPoints'];
            }
        });
        newValids = calcChallengesWork(chunks, baseChunkData);
        Object.keys(manualTasks).forEach(skill => {
            Object.keys(manualTasks[skill]).forEach(challenge => {
                if (!newValids[skill]) {
                    newValids[skill] = {};
                }
                newValids[skill][challenge] = manualTasks[skill][challenge];
            });
        });
        let fullyValid;
        Object.keys(newValids).forEach(skill => {
            skill !== 'BiS' && checkPrimaryMethod(skill, newValids, baseChunkData) && Object.keys(newValids[skill]).forEach(challenge => {
                if (skill !== 'Extra' || chunkInfo['challenges'][skill][challenge].hasOwnProperty('Requirements')) {
                    fullyValid = true;
                    !!chunkInfo['challenges'][skill][challenge]['Tasks'] && Object.keys(chunkInfo['challenges'][skill][challenge]['Tasks']).forEach(subTask => {
                        if ((!!valids[chunkInfo['challenges'][skill][challenge]['Tasks'][subTask]] && (!valids[chunkInfo['challenges'][skill][challenge]['Tasks'][subTask]].hasOwnProperty(subTask) || !newValids[chunkInfo['challenges'][skill][challenge]['Tasks'][subTask]].hasOwnProperty(subTask))) || (backlog[chunkInfo['challenges'][skill][challenge]['Tasks'][subTask]] && backlog[chunkInfo['challenges'][skill][challenge]['Tasks'][subTask]].hasOwnProperty(subTask))) {
                            fullyValid = false;
                            delete newValids[skill][challenge];
                            delete valids[skill][challenge];
                            if (Object.keys(newValids[skill]).length <= 0) {
                                delete newValids[skill];
                            }
                            if (Object.keys(valids[skill]).length <= 0) {
                                delete valids[skill];
                            }
                        }
                    });
                    if (!!chunkInfo['challenges'][skill][challenge]['BackupParent']) {
                        if ((!!valids[skill] && (valids[skill].hasOwnProperty(chunkInfo['challenges'][skill][challenge]['BackupParent']) || newValids[skill].hasOwnProperty(chunkInfo['challenges'][skill][challenge]['BackupParent']))) || (backlog[skill] && backlog[skill].hasOwnProperty(chunkInfo['challenges'][skill][challenge]['BackupParent']))) {
                            fullyValid = false;
                            delete newValids[skill][challenge];
                            delete valids[skill][challenge];
                            if (Object.keys(newValids[skill]).length <= 0) {
                                delete newValids[skill];
                            }
                            if (Object.keys(valids[skill]).length <= 0) {
                                delete valids[skill];
                            }
                        }
                    }
                    !!chunkInfo['challenges'][skill][challenge]['Requirements'] && chunkInfo['challenges'][skill][challenge]['Requirements'].forEach(req => {
                        if (!checkPrimaryMethod(req, newValids, baseChunkData)) {
                            fullyValid = false;
                            delete newValids[skill][challenge];
                            delete valids[skill][challenge];
                            if (Object.keys(newValids[skill]).length <= 0) {
                                delete newValids[skill];
                            }
                            if (Object.keys(valids[skill]).length <= 0) {
                                delete valids[skill];
                            }
                        }
                    });
                    if (fullyValid) {
                        !!chunkInfo['challenges'][skill][challenge]['Tasks'] && Object.keys(chunkInfo['challenges'][skill][challenge]['Tasks']).forEach(subTask => {
                            if (!!chunkInfo['challenges'][skill][challenge]['BaseQuest'] && !!chunkInfo['challenges'][chunkInfo['challenges'][skill][challenge]['Tasks'][subTask]][subTask] && !!chunkInfo['challenges'][chunkInfo['challenges'][skill][challenge]['Tasks'][subTask]][subTask]['BaseQuest'] && chunkInfo['challenges'][skill][challenge]['BaseQuest'] === chunkInfo['challenges'][chunkInfo['challenges'][skill][challenge]['Tasks'][subTask]][subTask]['BaseQuest'] && (!backlog[skill] || !backlog[skill].hasOwnProperty(challenge))) {
                                newValids[chunkInfo['challenges'][skill][challenge]['Tasks'][subTask]].hasOwnProperty(subTask) && (newValids[chunkInfo['challenges'][skill][challenge]['Tasks'][subTask]][subTask] = false);
                            }
                        });
                    }
                }
            });
            let extraSets = {};
            skill === 'Extra' && Object.keys(newValids[skill]).forEach(challenge => {
                if (chunkInfo['challenges'][skill][challenge].hasOwnProperty('Set')) {
                    if (!extraSets.hasOwnProperty(chunkInfo['challenges'][skill][challenge]['Set'])) {
                        extraSets[chunkInfo['challenges'][skill][challenge]['Set']] = challenge;
                    } else if (chunkInfo['challenges'][skill][challenge]['Priority'] < chunkInfo['challenges'][skill][extraSets[chunkInfo['challenges'][skill][challenge]['Set']]]['Priority']) {
                        delete newValids[skill][extraSets[newValids[skill][challenge]['Set']]];
                        delete valids[skill][extraSets[newValids[skill][challenge]['Set']]];
                        if (Object.keys(newValids[skill]).length <= 0) {
                            delete newValids[skill];
                        }
                        if (Object.keys(valids[skill]).length <= 0) {
                            delete valids[skill];
                        }
                        extraSets[chunkInfo['challenges'][skill][challenge]['Set']] = challenge;
                    } else {
                        delete newValids[skill][challenge];
                        delete valids[skill][challenge];
                        if (Object.keys(newValids[skill]).length <= 0) {
                            delete newValids[skill];
                        }
                        if (Object.keys(valids[skill]).length <= 0) {
                            delete valids[skill];
                        }
                    }
                }
            });
        });
        //console.log(i);
    } while (!_.isEqual(valids, newValids) && i < 10);
    valids = newValids;
    //console.log(baseChunkData);
    return valids;
}

// Checks if every source of an item is from a shop
var onlyShop = function(sources) {
    let allShop = true;
    Object.keys(sources).forEach(source => {
        if (sources[source] !== 'shop') {
            allShop = false;
        }
    });
    return allShop;
}

// Does the work to calculate all the possible challenges
var calcChallengesWork = function(chunks, baseChunkData) {
    let items = {...baseChunkData['items']};
    let objects = baseChunkData['objects'];
    let monsters = baseChunkData['monsters'];
    let npcs = baseChunkData['npcs'];
    let valids = {};
    extraOutputItems = {};

    let tempItemSkill = {};

    !!chunkInfo['challenges'] && !!chunkInfo['challenges']['Extra'] && Object.keys(chunkInfo['challenges']['Extra']).forEach(name => {
        if (chunkInfo['challenges']['Extra'][name].hasOwnProperty('Permanent') && !chunkInfo['challenges']['Extra'][name]['Permanent']) {
            delete chunkInfo['challenges']['Extra'][name];
        }
    });

    // Kill X
    if (rules['Kill X']) {
        if (!valids['Extra']) {
            valids['Extra'] = {};
        }
        Object.keys(monsters).sort().forEach(monster => {
            if (!backlog['Extra'] || !backlog['Extra']['Kill X ~|' + monster + '|~']) {
                valids['Extra']['Kill X ~|' + monster + '|~'] = 'Kill X';
                if (!chunkInfo['challenges']['Extra']) {
                    chunkInfo['challenges']['Extra'] = {};
                }
                chunkInfo['challenges']['Extra']['Kill X ~|' + monster + '|~'] = {
                    'Category': ['Kill X'],
                    'Monsters': [monster],
                    'MonstersDetails': [monster],
                    'Label': 'Kill X',
                    'Permanent': false
                }
            }
        });
    }

    // Every Drop
    if (rules['Every Drop']) {
        let drops = {};
        if (!valids['Extra']) {
            valids['Extra'] = {};
        }
        !!completedChallenges['Extra'] && Object.keys(completedChallenges['Extra']).forEach(line => {
            if (line.match(/.*: ~\|.*\|~ \(.*\)/)) {
                drops[line.split('|')[1]] = true;
            }
        });
        Object.keys(items).sort().forEach(item => {
            !!items[item] && Object.keys(items[item]).forEach(source => {
                let realSource = source.replaceAll('#', '%2F');
                if ((items[item][source].includes('-drop') || items[item][source].includes('-Slayer')) && !drops[item]) {
                    if (source.includes('Slay')) {
                        let monster = chunkInfo['challenges']['Slayer'][source.replaceAll('#', '%2F')]['Output'];
                        realSource = chunkInfo['challenges']['Slayer'][source.replaceAll('#', '%2F')]['Output'];
                        Object.keys(chunkInfo['skillItems']['Slayer'][monster]).forEach(drop => {
                            if (!!dropTables[drop] && ((drop !== 'RareDropTable+' && drop !== 'GemDropTable+') || rules['RDT'])) {
                                Object.keys(dropTables[drop]).forEach(item => {
                                    if ((rules['Rare Drop'] || isNaN(parseFloat(chunkInfo['skillItems']['Slayer'][monster][drop].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['skillItems']['Slayer'][monster][drop].split('/')[1])) || ((parseFloat(chunkInfo['skillItems']['Slayer'][monster][drop].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['skillItems']['Slayer'][monster][drop].split('/')[1]) * parseFloat(dropTables[drop][item].split('/')[0].replaceAll('~', '')) / parseFloat(dropTables[drop][item].split('/')[1]))) > (parseFloat(rareDropNum.split('/')[0].replaceAll('~', '')) / parseFloat(rareDropNum.split('/')[1]))) &&
                                        (rules['Boss'] || !bossMonsters.hasOwnProperty(monster))) {
                                        if (!dropRatesGlobal[monster]) {
                                            dropRatesGlobal[monster] = {};
                                        }
                                        dropRatesGlobal[monster][item] = findFraction(parseFloat(chunkInfo['skillItems']['Slayer'][monster][drop].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['skillItems']['Slayer'][monster][drop].split('/')[1]));
                                    }
                                });
                            } else if ((rules['Rare Drop'] || isNaN(parseFloat(chunkInfo['skillItems']['Slayer'][monster][drop].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['skillItems']['Slayer'][monster][drop].split('/')[1])) || (parseFloat(chunkInfo['skillItems']['Slayer'][monster][drop].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['skillItems']['Slayer'][monster][drop].split('/')[1])) > (parseFloat(rareDropNum.split('/')[0].replaceAll('~', '')) / parseFloat(rareDropNum.split('/')[1]))) &&
                                    (rules['Boss'] || !bossMonsters.hasOwnProperty(monster))) {
                                if (!dropRatesGlobal[monster]) {
                                    dropRatesGlobal[monster] = {};
                                }
                                dropRatesGlobal[monster][drop] = (chunkInfo['skillItems']['Slayer'][monster][drop].split('/').length <= 1) ? chunkInfo['skillItems']['Slayer'][monster][drop] : findFraction(parseFloat(chunkInfo['skillItems']['Slayer'][monster][drop].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['skillItems']['Slayer'][monster][drop].split('/')[1].replaceAll('~', '')));
                            }
                        });
                    }
                    if (!!dropRatesGlobal[realSource] && !!dropRatesGlobal[realSource][item] && (!backlog['Extra'] || !backlog['Extra'].hasOwnProperty(realSource.replaceAll('+', '') + ': ~|' + item.replaceAll('#', '%2F') + '|~ (' + dropRatesGlobal[realSource][item].replaceAll('/', '%2G') + ')'))) {
                        drops[item] = true;
                        valids['Extra'][realSource.replaceAll('+', '') + ': ~|' + item.replaceAll('#', '%2F') + '|~ (' + dropRatesGlobal[realSource][item].replaceAll('/', '%2G') + ')'] = 'Every Drop';
                        if (!chunkInfo['challenges']['Extra']) {
                            chunkInfo['challenges']['Extra'] = {};
                        }
                        chunkInfo['challenges']['Extra'][realSource.replaceAll('+', '') + ': ~|' + item.replaceAll('#', '%2F') + '|~ (' + dropRatesGlobal[realSource][item].replaceAll('/', '%2G') + ')'] = {
                            'Category': ['Every Drop'],
                            'Items': [item],
                            'ItemsDetails': [item],
                            'Label': 'Every Drop',
                            'Permanent': false
                        }
                    }
                }
            });
        });
    }

    // Max Cape
    if (rules['Skillcape'] && !!chunks && chunks.hasOwnProperty('11063')) {
        if (!valids['Extra']) {
            valids['Extra'] = {};
        }
        valids['Extra']['Buy the ~|Max cape|~. Nerd.'] = 'Skillcapes';
        if (!chunkInfo['challenges']['Extra']) {
            chunkInfo['challenges']['Extra'] = {};
        }
        chunkInfo['challenges']['Extra']['Buy the ~|Max cape|~. Nerd.'] = {
            'Category': ['Skillcape'],
            'Chunks': ['11063'],
            'ChunksDetails': ['11063'],
            'Label': 'Skillcapes',
            'Permanent': false
        }
    }

    !!chunkInfo['challenges'] && [...skillNames, 'Nonskill', 'Quest', 'Diary', 'Extra'].forEach(skill => {
        tempItemSkill[skill] = {};
        valids[skill] = {};
        !!chunkInfo['challenges'][skill] && Object.keys(chunkInfo['challenges'][skill]).sort(function(a, b){return chunkInfo['challenges'][skill][a]['Level']-chunkInfo['challenges'][skill][b]['Level']}).forEach(name => {
            wrongThings = [];
            !!chunkInfo['challenges'][skill][name]['Category'] && chunkInfo['challenges'][skill][name]['Category'].forEach(category => {
                if (maybePrimary.includes(category)) {
                    chunkInfo['challenges'][skill][name]['Primary'] = rules[category];
                }
            });
            let validChallenge = true;
            let tempSecondary = false;
            if (!!chunkInfo['challenges'][skill][name]['ManualInvalid'] && chunkInfo['challenges'][skill][name]['ManualInvalid']) {
                validChallenge = false;
                wrongThings.push('Manual');
            }
            chunkInfo['challenges'][skill][name]['ItemsDetails'] = [];
            chunkInfo['challenges'][skill][name]['ObjectsDetails'] = [];
            chunkInfo['challenges'][skill][name]['MonstersDetails'] = [];
            chunkInfo['challenges'][skill][name]['NPCsDetails'] = [];
            chunkInfo['challenges'][skill][name]['ChunksDetails'] = [];
            if (!!chunkInfo['challenges'][skill][name]['QuestPointsNeeded']) {
                if (questPointTotal < chunkInfo['challenges'][skill][name]['QuestPointsNeeded']) {
                    validChallenge = false;
                    wrongThings.push('QPS');
                }
            }
            if (skill === 'Extra' && chunkInfo['challenges'][skill][name].hasOwnProperty('Set')) {
                if (!!backlog[skill] && backlog[skill].hasOwnProperty(name)) {
                    validChallenge = false;
                    wrongThings.push('Set outclassed');
                }
            }
            !!chunkInfo['challenges'][skill][name]['Chunks'] && chunkInfo['challenges'][skill][name]['Chunks'].forEach(chunkId => {
                if (chunkId.includes('+')) {
                    if (!chunksPlus[chunkId]) {
                        validChallenge = false;
                        wrongThings.push(chunkId);
                    } else {
                        let tempValid = false;
                        Object.keys(chunks).forEach(cName => {
                            chunksPlus[chunkId].forEach(plus => {
                                if (plus === cName) {
                                    tempValid = true;
                                    let realName = plus;
                                    if (!!chunkInfo['chunks'][plus]['Name']) {
                                        realName = chunkInfo['chunks'][plus]['Name'];
                                    } else if (!!chunkInfo['chunks'][plus]['Nickname']) {
                                        realName = chunkInfo['chunks'][plus]['Nickname'] + '(' + plus + ')';
                                    }
                                    chunkInfo['challenges'][skill][name]['ChunksDetails'].push(realName);
                                }
                            });
                        });
                        if (!tempValid) {
                            validChallenge = false;
                            wrongThings.push(chunkId);
                        }
                    }
                } else {
                    let tempValid = false;
                    Object.keys(chunks).forEach(cName => {
                        if (chunkId === cName) {
                            tempValid = true;
                            let realName = chunkId;
                            if (!!chunkInfo['chunks'][chunkId]['Name']) {
                                realName = chunkInfo['chunks'][chunkId]['Name'];
                            } else if (!!chunkInfo['chunks'][chunkId]['Nickname']) {
                                realName = chunkInfo['chunks'][chunkId]['Nickname'] + '(' + chunkId + ')';
                            }
                            chunkInfo['challenges'][skill][name]['ChunksDetails'].push(realName);
                        }
                    });
                    if (!tempValid) {
                        validChallenge = false;
                        wrongThings.push(chunkId);
                    }
                }
            });
            let missingItems = [];
            let savedValid = validChallenge;
            let savedSecondary = tempSecondary;
            let staffItems = {};
            !!chunkInfo['challenges'][skill][name]['Items'] && chunkInfo['challenges'][skill][name]['Items'].forEach(item => {
                let secondary = item.includes('*');
                if (item.replaceAll(/\*/g, '').includes('+')) {
                    if (!itemsPlus[item.replaceAll(/\*/g, '')]) {
                        validChallenge = false;
                        wrongThings.push(item);
                    } else {
                        let tempValid = false;
                        let tempTempValid = false;
                        itemsPlus[item.replaceAll(/\*/g, '')].forEach(plus => {
                            if (!!items[plus] && (!chunkInfo['challenges'][skill][name].hasOwnProperty('NonShop') || !chunkInfo['challenges'][skill][name]['NonShop'] || !onlyShop(items[plus]))) {
                                tempValid = true;
                                chunkInfo['challenges'][skill][name]['ItemsDetails'].push(plus);
                                Object.keys(items[plus]).forEach(source => {
                                    if (item.includes('*')) {
                                        if (!items[plus][source].includes('secondary-') || items[plus][source].includes('primary-') || items[plus][source] === 'shop') {
                                            secondary = false;
                                        } else if (item === 'Air rune+*') {
                                            if (!!items['Staff of air']) {
                                                secondary = false;
                                            }
                                        }
                                    }
                                });
                                if (combatSkills.includes(skill) || (chunkInfo['challenges'][skill][name].hasOwnProperty('Category') && chunkInfo['challenges'][skill][name]['Category'].includes('BIS Skilling'))) {
                                    Object.keys(items[plus]).forEach(source => {
                                        if (!items[plus][source].includes('-') || !processingSkill[items[plus][source].split('-')[1]] || rules['Wield Crafted Items'] || items[plus][source].split('-')[1] === 'Slayer') {
                                            tempTempValid = true;
                                        }
                                    });
                                } else {
                                    tempTempValid = true;
                                }
                            }
                        });
                        !tempTempValid && (tempValid = false);
                        if (!tempValid) {
                            validChallenge = false;
                            wrongThings.push(item);
                        }
                    }
                    if (skill === 'Magic' && chunkInfo['challenges'][skill][name]['Primary']) {
                        missingItems.push(item);
                    }
                } else {
                    if (!items[item.replaceAll(/\*/g, '')] || (chunkInfo['challenges'][skill][name].hasOwnProperty('NonShop') && chunkInfo['challenges'][skill][name]['NonShop'] && onlyShop(items[item.replaceAll(/\*/g, '')]))) {
                        validChallenge = false;
                        wrongThings.push(item);
                    } else {
                        chunkInfo['challenges'][skill][name]['ItemsDetails'].push(item.replaceAll(/\*/g, ''));
                        if (item.includes('*') && !!items[item.replaceAll(/\*/g, '')]) {
                            Object.keys(items[item.replaceAll(/\*/g, '')]).forEach(source => {
                                if (!items[item.replaceAll(/\*/g, '')][source].includes('secondary-') || (items[item.replaceAll(/\*/g, '')][source].includes('primary-') && !processingSkill[items[item.replaceAll(/\*/g, '')][source].split('-')[1]]) || items[item.replaceAll(/\*/g, '')][source] === 'shop') {
                                    secondary = false;
                                }
                            });
                        }
                        if (combatSkills.includes(skill) || (chunkInfo['challenges'][skill][name].hasOwnProperty('Category') && chunkInfo['challenges'][skill][name]['Category'].includes('BIS Skilling'))) {
                            let tempTempValid = false;
                            Object.keys(items[item.replaceAll(/\*/g, '')]).forEach(source => {
                                if (!items[item.replaceAll(/\*/g, '')][source].includes('-') || !skillNames.includes(items[item.replaceAll(/\*/g, '')][source].split('-')[1]) || rules['Wield Crafted Items'] || items[item.replaceAll(/\*/g, '')][source].split('-')[1] === 'Slayer') {
                                    tempTempValid = true;
                                }
                            });
                            !tempTempValid && (validChallenge = false);
                            !tempTempValid && (wrongThings.push(item));
                        }
                    }
                    if (skill === 'Magic' && chunkInfo['challenges'][skill][name]['Primary']) {
                        missingItems.push(item);
                    }
                }
                !!secondary && (tempSecondary = true);
            });
            if (missingItems.length > 0) {
                let potentialValid = true;
                let potentialSecondary = false;
                let missingRunes = [];
                missingItems.forEach(it => {
                    let itSecondary = true;
                    if (it.replaceAll(/\*/g, '').includes('+')) {
                        if (!itemsPlus[it.replaceAll(/\*/g, '')]) {
                            if (elementalRunes.includes(it.replaceAll(/\*/g, '').replaceAll(/\+/g, ''))) {
                                missingRunes.push(it);
                            } else {
                                potentialValid = false;
                            }
                        } else {
                            let tempValid = false;
                            itemsPlus[it.replaceAll(/\*/g, '')].forEach(plus => {
                                if (!!items[plus]) {
                                    tempValid = true;
                                    if (it.includes('*')) {
                                        Object.keys(items[plus]).forEach(source => {
                                            if (!items[plus.replaceAll(/\*/g, '')][source].includes('secondary-') || items[plus.replaceAll(/\*/g, '')][source].includes('primary-') || items[plus.replaceAll(/\*/g, '')][source] === 'shop') {
                                                itSecondary = false;
                                            }
                                        });
                                    }
                                }
                            });
                            if (!tempValid) {
                                if (elementalRunes.includes(it.replaceAll(/\*/g, '').replaceAll(/\+/g, ''))) {
                                    missingRunes.push(it);
                                } else {
                                    potentialValid = false;
                                }
                            }
                        }
                    } else {
                        if (!items[it.replaceAll(/\*/g, '')]) {
                            if (elementalRunes.includes(it.replaceAll(/\*/g, '').replaceAll(/\+/g, ''))) {
                                missingRunes.push(it);
                            } else {
                                potentialValid = false;
                            }
                        } else {
                            if (it.includes('*')) {
                                Object.keys(items[it.replaceAll(/\*/g, '')]).forEach(source => {
                                    if (!items[it.replaceAll(/\*/g, '')][source].includes('secondary-') || items[it.replaceAll(/\*/g, '')][source].includes('primary-') || items[it.replaceAll(/\*/g, '')][source] === 'shop') {
                                        itSecondary = false;
                                    }
                                });
                            }
                        }
                    }
                    itSecondary && (potentialSecondary = true);
                });
                if (missingRunes.length === 1) {
                    let rune = missingRunes[0].replaceAll(/\*/g, '').replaceAll(/\+/g, '');
                    let foundStaff = false;
                    Object.keys(elementalStaves).forEach(staff => {
                        if (elementalStaves[staff].includes(rune) && !!items[staff] && !foundStaff) {
                            staffItems[rune] = {};
                            staffItems[rune][staff] =  'primary-staff';
                            foundStaff = true;
                            if (staff !== 'Staff of air') {
                                potentialSecondary = true;
                            }
                        }
                    });
                    if (!foundStaff) {
                        potentialValid = false;
                        potentialSecondary = true;
                    }
                } else if (missingRunes.length === 2) {
                    let foundStaff = false;
                    Object.keys(elementalStaves).forEach(staff => {
                        let matchingStaff = true;
                        missingRunes.forEach(rune => {
                            rune = rune.replaceAll(/\*/g, '').replaceAll(/\+/g, '');
                            if (!elementalStaves[staff].includes(rune)) {
                                matchingStaff = false;
                            }
                        });
                        if (matchingStaff && !!items[staff] && !foundStaff) {
                            missingRunes.forEach(rune => {
                                staffItems[rune] = {};
                                staffItems[rune][staff] =  'primary-staff';
                            });
                            foundStaff = true;
                        }
                    });
                    if (!foundStaff) {
                        potentialValid = false;
                        potentialSecondary = true;
                    }
                }
                !potentialValid ? (validChallenge = false) : (validChallenge = savedValid);
                !potentialValid && wrongThings.push('potentialValid');
                potentialSecondary ? (tempSecondary = true) : (tempSecondary = savedSecondary);
            }
            !!chunkInfo['challenges'][skill][name]['Objects'] && chunkInfo['challenges'][skill][name]['Objects'].forEach(object => {
                let secondary = true;
                if (object.includes('+')) {
                    if (!objectsPlus[object]) {
                        validChallenge = false;
                        wrongThings.push(object);
                    } else {
                        let tempValid = false;
                        objectsPlus[object].forEach(plus => {
                            if (!!objects[plus]) {
                                tempValid = true;
                                chunkInfo['challenges'][skill][name]['ObjectsDetails'].push(plus);
                                Object.keys(objects[plus.replaceAll(/\*/g, '')]).forEach(source => {
                                    if (!source.includes('secondary-')) {
                                        secondary = false;
                                    }
                                });
                            }
                        });
                        if (!tempValid) {
                            validChallenge = false;
                            wrongThings.push(object);
                        }
                    }
                } else {
                    if (!objects[object]) {
                        validChallenge = false;
                        wrongThings.push(object);
                    } else {
                        chunkInfo['challenges'][skill][name]['ObjectsDetails'].push(object);
                        Object.keys(objects[object]).forEach(source => {
                            if (!source.includes('secondary-')) {
                                secondary = false;
                            }
                        });
                    }
                }
                !!secondary && (tempSecondary = true);
            });
            !!chunkInfo['challenges'][skill][name]['Monsters'] && chunkInfo['challenges'][skill][name]['Monsters'].forEach(monster => {
                if (monster.includes('+')) {
                    if (!monstersPlus[monster]) {
                        if (monster !== 'Monster+') {
                            validChallenge = false;
                            wrongThings.push(monster);
                        } else if (!monsters || Object.keys(monsters).length <= 0) {
                            validChallenge = false;
                            wrongThings.push(monster);
                        }
                    } else {
                        let tempValid = false;
                        monstersPlus[monster].forEach(plus => {
                            if (!!monsters[plus]) {
                                chunkInfo['challenges'][skill][name]['MonstersDetails'].push(plus);
                                tempValid = true;
                            }
                        });
                        if (!tempValid) {
                            validChallenge = false;
                            wrongThings.push(monster);
                        }
                    }
                } else {
                    if (!monsters[monster]) {
                        validChallenge = false;
                        wrongThings.push(monster);
                    } else {
                        chunkInfo['challenges'][skill][name]['MonstersDetails'].push(monster);
                    }
                }
            });
            !!chunkInfo['challenges'][skill][name]['NPCs'] && chunkInfo['challenges'][skill][name]['NPCs'].forEach(npc => {
                if (npc.includes('+')) {
                    if (!npcsPlus[npc]) {
                        validChallenge = false;
                        wrongThings.push(npc);
                    } else {
                        let tempValid = false;
                        npcsPlus[npc].forEach(plus => {
                            if (!!npcs[plus]) {
                                chunkInfo['challenges'][skill][name]['NPCsDetails'].push(plus);
                                tempValid = true;
                            }
                        });
                        if (!tempValid) {
                            validChallenge = false;
                            wrongThings.push(npc);
                        }
                    }
                } else {
                    if (!npcs[npc]) {
                        validChallenge = false;
                        wrongThings.push(npc);
                    } else {
                        chunkInfo['challenges'][skill][name]['NPCsDetails'].push(npc);
                    }
                }
            });
            !!chunkInfo['challenges'][skill][name]['Mix'] && chunkInfo['challenges'][skill][name]['Mix'].forEach(mix => {
                if (mix.includes('+')) {
                    if (!mixPlus[mix]) {
                        validChallenge = false;
                        wrongThings.push(mix);
                    } else {
                        let tempValid = false;
                        mixPlus[mix].forEach(plus => {
                            if (!!monsters[plus] || !!npcs[plus]) {
                                chunkInfo['challenges'][skill][name]['MonstersDetails'].push(plus);
                                chunkInfo['challenges'][skill][name]['NPCsDetails'].push(plus);
                                tempValid = true;
                            }
                        });
                        if (!tempValid) {
                            validChallenge = false;
                            wrongThings.push(mix);
                        }
                    }
                } else {
                    if (!monsters[mix] && !npcs[mix]) {
                        validChallenge = false;
                        wrongThings.push(mix);
                    } else {
                        chunkInfo['challenges'][skill][name]['MonstersDetails'].push(mix);
                        chunkInfo['challenges'][skill][name]['NPCsDetails'].push(mix);
                    }
                }
            });
            chunkInfo['challenges'][skill][name]['Secondary'] = tempSecondary;
            !!chunkInfo['challenges'][skill][name]['Category'] && Object.keys(rules).forEach(rule => {
                if (chunkInfo['challenges'][skill][name]['Category'].includes(rule) && !maybePrimary.includes(rule) && !rules[rule]) {
                    validChallenge = false;
                    wrongThings.push(rule);
                }
                if (rule === 'Shortcut Task' && chunkInfo['challenges'][skill][name]['Category'].includes('Shortcut') && !rules[rule] && chunkInfo['challenges'][skill][name]['Level'] > 1) {
                    validChallenge = false;
                    wrongThings.push('Shortcut');
                }
            });
            if (validChallenge) {
                delete nonValids[name];
                if (!processingSkill[skill] || !chunkInfo['challenges'][skill][name]['Items']) {
                    if (skill !== 'Quest' && skill !== 'Diary') {
                        valids[skill][name] = chunkInfo['challenges'][skill][name]['Level'] || chunkInfo['challenges'][skill][name]['Label'] || true;
                    } else {
                        valids[skill][name] = true;
                    }
                } else {
                    let itemList = [];
                    !!chunkInfo['challenges'][skill][name]['Items'] && chunkInfo['challenges'][skill][name]['Items'].forEach(item => {
                        itemList.push(item);
                    });
                    !!staffItems && Object.keys(staffItems).forEach(item => {
                        if (!tempItemSkill[skill][item]) {
                            tempItemSkill[skill][item] = [];
                        }
                        tempItemSkill[skill][item].push(name);
                    });
                    let index = 0;
                    let listDone = false;
                    let thingsAdded = false;
                    while (!listDone) {
                        let item = itemList[index++];
                        if (item.replaceAll(/\*/g, '').includes('+')) {
                            !!itemsPlus[item.replaceAll(/\*/g, '')] && itemsPlus[item.replaceAll(/\*/g, '')].forEach(plus => {
                                if (!!items[plus] && (!Object.values(items[plus]).includes('primary-Farming') || rules['Farming Primary'])) {
                                    if (!tools[plus] && (skill !== 'Magic' || !magicTools[plus])) {
                                        let nonskill = {};
                                        let tempNonValid = true;
                                        !!items[plus] && Object.keys(items[plus]).forEach(source => {
                                            if (items[plus][source].includes('Nonskill') && !source.includes('*')) {
                                                if (!nonskill['Nonskill']) {
                                                    nonskill['Nonskill'] = {};
                                                }
                                                nonskill['Nonskill'][source] = true;
                                            } else if ((!skillNames.includes(items[plus][source].split('-')[1]) || rules['Multi Step Processing']) && skillNames.includes(items[plus][source].split('-')[1]) && processingSkill[skill] && !source.includes('*') && processingSkill[items[plus][source].split('-')[1]]) {
                                                if (!nonskill[items[plus][source].split('-')[1]]) {
                                                    nonskill[items[plus][source].split('-')[1]] = {};
                                                }
                                                nonskill[items[plus][source].split('-')[1]][source] = true;
                                            }
                                            if ((!processingSkill[items[plus][source].split('-')[1]] || rules['Multi Step Processing']) && (!items[plus][source].includes('-Farming') || rules['Farming Primary'])) {
                                                tempNonValid = false;
                                            }
                                        });
                                        if (Object.keys(nonskill).length > 0) {
                                            !!nonskill && Object.keys(nonskill).forEach(skill => {
                                                !!nonskill[skill] && Object.keys(nonskill[skill]).forEach(src => {
                                                    !!chunkInfo['challenges'][skill][src]['Items'] && chunkInfo['challenges'][skill][src]['Items'].forEach(it => {
                                                        itemList.push(it);
                                                    });
                                                });
                                            });
                                        } else if (!tempNonValid) {
                                            if (!tempItemSkill[skill][plus]) {
                                                tempItemSkill[skill][plus] = [];
                                            }
                                            tempItemSkill[skill][plus].push(name);
                                            thingsAdded = true;
                                        }
                                    }
                                }
                            });
                        } else {
                            if (!!items && !tools[item.replaceAll(/\*/g, '')] && !!items[item.replaceAll(/\*/g, '')] && (skill !== 'Magic' || !magicTools[item.replaceAll(/\*/g, '')])) {
                                let nonskill = {};
                                let tempNonValid = true;
                                !!items[item.replaceAll(/\*/g, '')] && Object.keys(items[item.replaceAll(/\*/g, '')]).forEach(source => {
                                    if (items[item.replaceAll(/\*/g, '')][source].includes('Nonskill') && !source.includes('*')) {
                                        if (!nonskill['Nonskill']) {
                                            nonskill['Nonskill'] = {};
                                        }
                                        nonskill['Nonskill'][source] = true;
                                    } else if ((!skillNames.includes(items[item.replaceAll(/\*/g, '')][source].split('-')[1]) || rules['Multi Step Processing']) && skillNames.includes(items[item.replaceAll(/\*/g, '')][source].split('-')[1]) && processingSkill[skill] && !source.includes('*') && processingSkill[items[item.replaceAll(/\*/g, '')][source].split('-')[1]]) {
                                        if (!nonskill[items[item.replaceAll(/\*/g, '')][source].split('-')[1]]) {
                                            nonskill[items[item.replaceAll(/\*/g, '')][source].split('-')[1]] = {};
                                        }
                                        nonskill[items[item.replaceAll(/\*/g, '')][source].split('-')[1]][source] = true;
                                    }
                                    if ((!processingSkill[items[item.replaceAll(/\*/g, '')][source].split('-')[1]] || rules['Multi Step Processing']) && (!items[item.replaceAll(/\*/g, '')][source].includes('-Farming') || rules['Farming Primary'])) {
                                        tempNonValid = false;
                                    }
                                });
                                if (Object.keys(nonskill).length > 0) {
                                    !!nonskill && Object.keys(nonskill).forEach(skill => {
                                        !!nonskill[skill] && Object.keys(nonskill[skill]).forEach(src => {
                                            !!chunkInfo['challenges'][skill][src]['Items'] && chunkInfo['challenges'][skill][src]['Items'].forEach(it => {
                                                itemList.push(it);
                                            });
                                        });
                                    });
                                } else if (!tempNonValid) {
                                    if (!tempItemSkill[skill][item.replaceAll(/\*/g, '')]) {
                                        tempItemSkill[skill][item.replaceAll(/\*/g, '')] = [];
                                    }
                                    tempItemSkill[skill][item.replaceAll(/\*/g, '')].push(name);
                                    thingsAdded = true;
                                }
                            }
                        }
                        listDone = itemList.length <= index;
                    };
                    if (!thingsAdded) {
                        valids[skill][name] = false;
                    }
                }
            } else {
                nonValids[name] = wrongThings;
            }
        });
    });
    //console.log(tempItemSkill);
    Object.keys(tempItemSkill).forEach(skill => {
        Object.keys(tempItemSkill[skill]).forEach(item => {
            if (rules["Highest Level"]) {
                !!items[item] && tempItemSkill[skill][item].forEach(name => {
                    valids[skill][name] = chunkInfo['challenges'][skill][name]['Level'];
                });
            } else {
                let lowestItem;
                let lowestName;
                !!items[item] && tempItemSkill[skill][item].forEach(name => {
                    let challenge = chunkInfo['challenges'][skill][name];
                    if (!!challenge && !!challenge['Output']) {
                        if (!extraOutputItems[skill]) {
                            extraOutputItems[skill] = {};
                        }
                        extraOutputItems[skill][name] = challenge['Output'];
                    }
                    if (!lowestItem || lowestItem['Level'] > challenge['Level']) {
                        lowestItem = challenge;
                        lowestName = name;
                    } else if (lowestItem['Level'] === challenge['Level'] && ((!!challenge['Priority'] && (challenge['Priority'] < lowestItem['Priority'])) || !lowestItem['Priority'])) {
                        lowestItem = challenge;
                        lowestName = name;
                    }
                });
                !!lowestName && (valids[skill][lowestName] = chunkInfo['challenges'][skill][lowestName]['Level']);
            }
        });
    });
    //console.log(valids);
    return valids;
}

// Checks if skill has primary training
var checkPrimaryMethod = function(skill, valids, baseChunkData) {
    let valid = false;
    if (!!completedChallenges[skill] && Object.keys(completedChallenges[skill]).length > 0) {
        valid = true;
    } else if (!!manualTasks[skill] && Object.keys(manualTasks[skill]).length > 0) {
        valid = true;
    } else {
        let tempValid = true;
        !!universalPrimary[skill] && universalPrimary[skill].forEach(line => {
            if (line === 'Primary+') {
                let primaryValid = false;
                !!valids[skill] && Object.keys(valids[skill]).forEach(challenge => {
                    if (((chunkInfo['challenges'][skill][challenge]['Primary'] && (!chunkInfo['challenges'][skill][challenge]['Secondary'] || rules['Secondary Primary'])) && chunkInfo['challenges'][skill][challenge]['Level'] === 1 && (!backlog[skill] || !backlog[skill].hasOwnProperty(challenge))) || chunkInfo['challenges'][skill][challenge]['Manual']) {
                        if (skill !== 'Smithing' || rules['Smithing by Smelting'] || baseChunkData['objects'].hasOwnProperty('Anvil')) {
                            primaryValid = true;
                        }
                    }
                });
                !primaryValid && (tempValid = false);
            } else if (line === 'Monster+') {
                let monsterExists = !!baseChunkData['monsters'] && Object.keys(baseChunkData['monsters']).length > 0;
                if (!monsterExists) {
                    tempValid = false;
                }
            } else if (line === 'Bones+') {
                let bonesExists = false;
                !!baseChunkData['items'] && boneItems.forEach(bone => {
                    if (!!baseChunkData['items'] && Object.keys(baseChunkData['items']).includes(bone)) {
                        bonesExists = true;
                    }
                });
                if (!bonesExists) {
                    tempValid = false;
                }
            } else if (line === 'Combat+') {
                let combatExists = false;
                combatSkills.forEach(skill2 => {
                    if (checkPrimaryMethod(skill2, valids, baseChunkData)) {
                        combatExists = true;
                    }
                });
                if (!combatExists) {
                    tempValid = false;
                }
            } else if (line === 'Ranged+') {
                let validRanged = false;
                !!baseChunkData['items'] && rangedItems.forEach(set => {
                    let innerValid = true;
                    set.forEach(item => {
                        if (!!baseChunkData['items'] && !Object.keys(baseChunkData['items']).includes(item.replaceAll(/\*/g, ''))) {
                            innerValid = false;
                        } else if (item.includes('*')) {
                            let tempSecondary = true;
                            item.includes('*') && !!baseChunkData['items'][item.replaceAll(/\*/g, '')] && Object.keys(baseChunkData['items'][item.replaceAll(/\*/g, '')]).forEach(source => {
                                if ((!baseChunkData['items'][item.replaceAll(/\*/g, '')][source].includes('secondary-') && !processingSkill[baseChunkData['items'][item.replaceAll(/\*/g, '')][source].split('-')[1]]) || (baseChunkData['items'][item.replaceAll(/\*/g, '')][source].includes('primary-') && !processingSkill[baseChunkData['items'][item.replaceAll(/\*/g, '')][source].split('-')[1]]) || baseChunkData['items'][item.replaceAll(/\*/g, '')][source] === 'shop' || rules['Secondary Primary']) {
                                    tempSecondary = false;
                                }
                            });
                            tempSecondary && (innerValid = false);
                        }
                    });
                    innerValid && (validRanged = true);
                });
                if (!validRanged) {
                    tempValid = false;
                }
            } else {
                tempValid = false;
            }
        });
        valid = tempValid;
    }
    return valid;
}

var calcBIS = function() {
    let combatStyles = ['Melee', 'Ranged', 'Magic'];
    let primarySkill = {};
    skillNames.forEach(skill => {
        primarySkill[skill] = checkPrimaryMethod(skill, globalValids, baseChunkData);
    });
    if (rules['Show Best in Slot Prayer Tasks']) {
        combatStyles.push('Prayer');
    }
    if (rules['Show Best in Slot Defensive Tasks']) {
        combatStyles.push('Melee Tank');
        combatStyles.push('Ranged Tank');
        combatStyles.push('Magic Tank');
    }
    if (rules['Show Best in Slot Flinching Tasks']) {
        combatStyles.push('Flinch');
    }
    if (!globalValids['BiS']) {
        globalValids['BiS'] = {};
    }
    !!globalValids['BiS'] && Object.keys(globalValids['BiS']).forEach(name => {
        if (globalValids['BiS'][name].includes('BiS')) {
            delete globalValids['BiS'][name];
        }
    });
    let completedEquipment = {};
    !!completedChallenges['BiS'] && Object.keys(completedChallenges['BiS']).forEach(equipLine => {
        let equip = equipLine.split('|')[1].charAt(0).toUpperCase() + equipLine.split('|')[1].slice(1);
        completedEquipment[equip] = chunkInfo['equipment'][equip];
    });
    !!checkedChallenges['BiS'] && Object.keys(checkedChallenges['BiS']).forEach(equipLine => {
        let equip = equipLine.split('|')[1].charAt(0).toUpperCase() + equipLine.split('|')[1].slice(1);
        completedEquipment[equip] = chunkInfo['equipment'][equip];
    });
    let notFresh = {};
    highestOverall = {};
    let vowels = ['a', 'e', 'i', 'o', 'u'];
    combatStyles.forEach(skill => {
        let bestEquipment = {};
        Object.keys({...completedEquipment, ...chunkInfo['equipment']}).forEach(equip => {
            let validWearable = true;
            !!chunkInfo['equipment'][equip].requirements && chunkInfo['equipment'][equip].requirements.forEach(skill => {
                if (!primarySkill[skill.charAt(0).toUpperCase() + skill.slice(1)]) {
                    validWearable = false;
                }
            });
            if (!!baseChunkData['items'][equip] && validWearable) {
                if (skill === 'Melee') {
                    if (chunkInfo['equipment'][equip].attack_speed > 0) {
                        if ((!bestEquipment[chunkInfo['equipment'][equip].slot] || (((Math.max(chunkInfo['equipment'][equip].attack_crush, chunkInfo['equipment'][equip].attack_slash, chunkInfo['equipment'][equip].attack_stab) + chunkInfo['equipment'][equip].melee_strength + 64) / chunkInfo['equipment'][equip].attack_speed) > ((Math.max(chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_crush, chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_slash, chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_stab) + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].melee_strength + 64) / chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_speed))) && Math.max(chunkInfo['equipment'][equip].attack_crush, chunkInfo['equipment'][equip].attack_slash, chunkInfo['equipment'][equip].attack_stab) > 0 && chunkInfo['equipment'][equip].melee_strength > 0) {
                            let tempTempValid = false;
                            Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                    tempTempValid = true;
                                }
                            });
                            let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                            tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                        }
                    } else {
                        if ((Math.min(chunkInfo['equipment'][equip].attack_crush, chunkInfo['equipment'][equip].attack_slash, chunkInfo['equipment'][equip].attack_stab) >= 0 || chunkInfo['equipment'][equip].melee_strength > 0) && chunkInfo['equipment'][equip].slot !== 'ammo') {
                            if (!bestEquipment[chunkInfo['equipment'][equip].slot] || (chunkInfo['equipment'][equip].melee_strength > chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].melee_strength)) {
                                let tempTempValid = false;
                                Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                    if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                        tempTempValid = true;
                                    }
                                });
                                let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                                article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                                tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                            } else if ((chunkInfo['equipment'][equip].melee_strength === chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].melee_strength) && ((chunkInfo['equipment'][equip].attack_crush + chunkInfo['equipment'][equip].attack_slash + chunkInfo['equipment'][equip].attack_stab) > (chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_crush + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_slash + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_stab))) {
                                let tempTempValid = false;
                                Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                    if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                        tempTempValid = true;
                                    }
                                });
                                let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                                article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                                tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                            } else if ((chunkInfo['equipment'][equip].melee_strength === chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].melee_strength) &&
                            ((chunkInfo['equipment'][equip].attack_crush + chunkInfo['equipment'][equip].attack_slash + chunkInfo['equipment'][equip].attack_stab) === (chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_crush + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_slash + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_stab)) &&
                            ((chunkInfo['equipment'][equip].defence_crush + chunkInfo['equipment'][equip].defence_magic + chunkInfo['equipment'][equip].defence_ranged + chunkInfo['equipment'][equip].defence_slash + chunkInfo['equipment'][equip].defence_stab) > (chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_crush + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_magic + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_ranged + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_slash + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_stab))) {
                                let tempTempValid = false;
                                Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                    if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                        tempTempValid = true;
                                    }
                                });
                                let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                                article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                                tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                            }
                        }
                    }
                } else if (skill === 'Ranged') {
                    if (chunkInfo['equipment'][equip].attack_speed > 0) {
                        if ((!bestEquipment[chunkInfo['equipment'][equip].slot] || (((chunkInfo['equipment'][equip].attack_ranged + chunkInfo['equipment'][equip].ranged_strength + 64) / chunkInfo['equipment'][equip].attack_speed) > ((chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_ranged + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].ranged_strength + 64) / chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_speed))) && chunkInfo['equipment'][equip].attack_ranged > 0) {
                            let tempTempValid = false;
                            Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                    tempTempValid = true;
                                }
                            });
                            let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                            tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                        }
                    } else {
                        if (chunkInfo['equipment'][equip].attack_ranged >= 0 || chunkInfo['equipment'][equip].ranged_strength > 0) {
                            if (!bestEquipment[chunkInfo['equipment'][equip].slot] || (chunkInfo['equipment'][equip].ranged_strength > chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].ranged_strength)) {
                                let tempTempValid = false;
                                Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                    if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                        tempTempValid = true;
                                    }
                                });
                                let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                                article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                                tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                            } else if ((chunkInfo['equipment'][equip].ranged_strength === chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].ranged_strength) && (chunkInfo['equipment'][equip].attack_ranged > chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_ranged)) {
                                let tempTempValid = false;
                                Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                    if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                        tempTempValid = true;
                                    }
                                });
                                let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                                article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                                tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                            } else if ((chunkInfo['equipment'][equip].ranged_strength === chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].ranged_strength) &&
                            (chunkInfo['equipment'][equip].attack_ranged === chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_ranged) &&
                            ((chunkInfo['equipment'][equip].defence_crush + chunkInfo['equipment'][equip].defence_magic + chunkInfo['equipment'][equip].defence_ranged + chunkInfo['equipment'][equip].defence_slash + chunkInfo['equipment'][equip].defence_stab) > (chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_crush + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_magic + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_ranged + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_slash + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_stab))) {
                                let tempTempValid = false;
                                Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                    if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                        tempTempValid = true;
                                    }
                                });
                                let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                                article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                                tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                            }
                        }
                    }
                } else if (skill === 'Magic') {
                    if (chunkInfo['equipment'][equip].attack_speed > 0) {
                        if ((!bestEquipment[chunkInfo['equipment'][equip].slot] || (chunkInfo['equipment'][equip].attack_magic > chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_magic)) && chunkInfo['equipment'][equip].attack_magic > 0) {
                            let tempTempValid = false;
                            Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                    tempTempValid = true;
                                }
                            });
                            let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                            tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                        }
                    } else {
                        if ((chunkInfo['equipment'][equip].attack_magic >= 0 || chunkInfo['equipment'][equip].magic_damage > 0) && chunkInfo['equipment'][equip].slot !== 'ammo') {
                            if (!bestEquipment[chunkInfo['equipment'][equip].slot] || (chunkInfo['equipment'][equip].magic_damage > chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].magic_damage)) {
                                let tempTempValid = false;
                                Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                    if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                        tempTempValid = true;
                                    }
                                });
                                let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                                article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                                tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                            } else if ((chunkInfo['equipment'][equip].magic_damage === chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].magic_damage) && (chunkInfo['equipment'][equip].attack_magic > chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_magic)) {
                                let tempTempValid = false;
                                Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                    if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                        tempTempValid = true;
                                    }
                                });
                                let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                                article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                                tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                            } else if ((chunkInfo['equipment'][equip].magic_damage === chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].magic_damage) &&
                            (chunkInfo['equipment'][equip].attack_magic === chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_magic) &&
                            ((chunkInfo['equipment'][equip].defence_crush + chunkInfo['equipment'][equip].defence_magic + chunkInfo['equipment'][equip].defence_ranged + chunkInfo['equipment'][equip].defence_slash + chunkInfo['equipment'][equip].defence_stab) > (chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_crush + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_magic + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_ranged + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_slash + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_stab))) {
                                let tempTempValid = false;
                                Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                    if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                        tempTempValid = true;
                                    }
                                });
                                let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                                article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                                tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                            }
                        }
                    }
                } else if (skill === 'Prayer') {
                    if (chunkInfo['equipment'][equip].prayer > 0) {
                        if (!bestEquipment[chunkInfo['equipment'][equip].slot] || (chunkInfo['equipment'][equip].prayer > chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].prayer)) {
                            let tempTempValid = false;
                            Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                    tempTempValid = true;
                                }
                            });
                            let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                            tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                        }
                    }
                } else if (skill === 'Melee Tank') {
                    if (Math.max(chunkInfo['equipment'][equip].defence_crush, chunkInfo['equipment'][equip].defence_slash, chunkInfo['equipment'][equip].defence_stab) > 0) {
                        if (!bestEquipment[chunkInfo['equipment'][equip].slot] || ((chunkInfo['equipment'][equip].defence_crush + chunkInfo['equipment'][equip].defence_slash + chunkInfo['equipment'][equip].defence_stab) > (chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_crush + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_slash + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_stab))) {
                            let tempTempValid = false;
                            Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                    tempTempValid = true;
                                }
                            });
                            let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                            tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                        }
                    }
                } else if (skill === 'Ranged Tank') {
                    if (chunkInfo['equipment'][equip].defence_ranged > 0) {
                        if (!bestEquipment[chunkInfo['equipment'][equip].slot] || (chunkInfo['equipment'][equip].defence_ranged > chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_ranged)) {
                            let tempTempValid = false;
                            Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                    tempTempValid = true;
                                }
                            });
                            let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                            tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                        }
                    }
                } else if (skill === 'Magic Tank') {
                    if (chunkInfo['equipment'][equip].defence_magic > 0) {
                        if (!bestEquipment[chunkInfo['equipment'][equip].slot] || (chunkInfo['equipment'][equip].defence_magic > chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].defence_magic)) {
                            let tempTempValid = false;
                            Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                    tempTempValid = true;
                                }
                            });
                            let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                            tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                        }
                    }
                } else if (skill === 'Flinch') {
                    if (chunkInfo['equipment'][equip].attack_speed > 0 || chunkInfo['equipment'][equip].slot === 'shield') {
                        if ((!bestEquipment[chunkInfo['equipment'][equip].slot] || ((Math.max(chunkInfo['equipment'][equip].attack_crush, chunkInfo['equipment'][equip].attack_slash, chunkInfo['equipment'][equip].attack_stab) + chunkInfo['equipment'][equip].melee_strength) > (Math.max(chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_crush, chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_slash, chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].attack_stab) + chunkInfo['equipment'][bestEquipment[chunkInfo['equipment'][equip].slot]].melee_strength))) && Math.max(chunkInfo['equipment'][equip].attack_crush, chunkInfo['equipment'][equip].attack_slash, chunkInfo['equipment'][equip].attack_stab) > 0 && chunkInfo['equipment'][equip].melee_strength > 0) {
                            let tempTempValid = false;
                            Object.keys(baseChunkData['items'][equip]).forEach(source => {
                                if (!baseChunkData['items'][equip][source].includes('-') || !processingSkill[baseChunkData['items'][equip][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][equip][source].split('-')[1] === 'Slayer') {
                                    tempTempValid = true;
                                }
                            });
                            let article = vowels.includes(equip.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = equip.toLowerCase().charAt(equip.toLowerCase().length - 1) === 's' ? ' ' : article;
                            tempTempValid && (!backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + equip.toLowerCase() + '|~')) && (bestEquipment[chunkInfo['equipment'][equip].slot] = equip);
                        }
                    }
                }
            }
        });
        let twoHPower = 0;
        let weaponShieldPower = 0;
        if (skill === 'Melee') {
            if (bestEquipment.hasOwnProperty('2h')) {
                twoHPower = (Math.max(chunkInfo['equipment'][bestEquipment['2h']].attack_crush, chunkInfo['equipment'][bestEquipment['2h']].attack_slash, chunkInfo['equipment'][bestEquipment['2h']].attack_stab) + chunkInfo['equipment'][bestEquipment['2h']].melee_strength + 64) / chunkInfo['equipment'][bestEquipment['2h']].attack_speed;
            }
            if (bestEquipment.hasOwnProperty('weapon')) {
                if (bestEquipment.hasOwnProperty('shield')) {
                    weaponShieldPower = (Math.max((chunkInfo['equipment'][bestEquipment['weapon']].attack_crush + chunkInfo['equipment'][bestEquipment['shield']].attack_crush), (chunkInfo['equipment'][bestEquipment['weapon']].attack_slash + chunkInfo['equipment'][bestEquipment['shield']].attack_slash), (chunkInfo['equipment'][bestEquipment['weapon']].attack_stab + chunkInfo['equipment'][bestEquipment['shield']].attack_stab)) + (chunkInfo['equipment'][bestEquipment['weapon']].melee_strength + chunkInfo['equipment'][bestEquipment['shield']].melee_strength) + 64) / chunkInfo['equipment'][bestEquipment['weapon']].attack_speed;
                } else {
                    weaponShieldPower = (Math.max(chunkInfo['equipment'][bestEquipment['weapon']].attack_crush, chunkInfo['equipment'][bestEquipment['weapon']].attack_slash, chunkInfo['equipment'][bestEquipment['weapon']].attack_stab) + chunkInfo['equipment'][bestEquipment['weapon']].melee_strength + 64) / chunkInfo['equipment'][bestEquipment['weapon']].attack_speed;
                }
            }
        } else if (skill === 'Ranged') {
            if (bestEquipment.hasOwnProperty('2h')) {
                twoHPower = (chunkInfo['equipment'][bestEquipment['2h']].attack_ranged + chunkInfo['equipment'][bestEquipment['2h']].ranged_strength + 64) / chunkInfo['equipment'][bestEquipment['2h']].attack_speed;
            }
            if (bestEquipment.hasOwnProperty('weapon')) {
                if (bestEquipment.hasOwnProperty('shield')) {
                    weaponShieldPower = ((chunkInfo['equipment'][bestEquipment['weapon']].attack_ranged + chunkInfo['equipment'][bestEquipment['shield']].attack_ranged) + (chunkInfo['equipment'][bestEquipment['weapon']].ranged_strength + chunkInfo['equipment'][bestEquipment['shield']].ranged_strength) + 64) / chunkInfo['equipment'][bestEquipment['weapon']].attack_speed;
                } else {
                    weaponShieldPower = (chunkInfo['equipment'][bestEquipment['weapon']].attack_ranged + chunkInfo['equipment'][bestEquipment['weapon']].ranged_strength + 64) / chunkInfo['equipment'][bestEquipment['weapon']].attack_speed;
                }
            }
        } else if (skill === 'Magic') {
            if (bestEquipment.hasOwnProperty('2h')) {
                twoHPower = chunkInfo['equipment'][bestEquipment['2h']].attack_magic;
            }
            if (bestEquipment.hasOwnProperty('weapon')) {
                if (bestEquipment.hasOwnProperty('shield')) {
                    weaponShieldPower = chunkInfo['equipment'][bestEquipment['weapon']].attack_magic + chunkInfo['equipment'][bestEquipment['shield']].attack_magic;
                } else {
                    weaponShieldPower = chunkInfo['equipment'][bestEquipment['weapon']].attack_magic;
                }
            }
        } else if (skill === 'Prayer') {
            if (bestEquipment.hasOwnProperty('2h')) {
                twoHPower = chunkInfo['equipment'][bestEquipment['2h']].prayer;
            }
            if (bestEquipment.hasOwnProperty('weapon') || bestEquipment.hasOwnProperty('shield')) {
                if (bestEquipment.hasOwnProperty('weapon') && !bestEquipment.hasOwnProperty('shield')) {
                    weaponShieldPower = chunkInfo['equipment'][bestEquipment['weapon']].prayer;
                } else if (bestEquipment.hasOwnProperty('shield') && !bestEquipment.hasOwnProperty('weapon')) {
                    weaponShieldPower = chunkInfo['equipment'][bestEquipment['shield']].prayer;
                } else {
                    weaponShieldPower = chunkInfo['equipment'][bestEquipment['weapon']].prayer + chunkInfo['equipment'][bestEquipment['shield']].prayer;
                }
            }
        } else if (skill === 'Flinch') {
            if (bestEquipment.hasOwnProperty('2h')) {
                twoHPower = Math.max(chunkInfo['equipment'][bestEquipment['2h']].attack_crush, chunkInfo['equipment'][bestEquipment['2h']].attack_slash, chunkInfo['equipment'][bestEquipment['2h']].attack_stab) + chunkInfo['equipment'][bestEquipment['2h']].melee_strength;
            }
            if (bestEquipment.hasOwnProperty('weapon')) {
                if (bestEquipment.hasOwnProperty('shield')) {
                    weaponShieldPower = Math.max((chunkInfo['equipment'][bestEquipment['weapon']].attack_crush + chunkInfo['equipment'][bestEquipment['shield']].attack_crush), (chunkInfo['equipment'][bestEquipment['weapon']].attack_slash + chunkInfo['equipment'][bestEquipment['shield']].attack_slash), (chunkInfo['equipment'][bestEquipment['weapon']].attack_stab + chunkInfo['equipment'][bestEquipment['shield']].attack_stab)) + (chunkInfo['equipment'][bestEquipment['weapon']].melee_strength + chunkInfo['equipment'][bestEquipment['shield']].melee_strength);
                } else {
                    weaponShieldPower = Math.max(chunkInfo['equipment'][bestEquipment['weapon']].attack_crush, chunkInfo['equipment'][bestEquipment['weapon']].attack_slash, chunkInfo['equipment'][bestEquipment['weapon']].attack_stab) + chunkInfo['equipment'][bestEquipment['weapon']].melee_strength;
                }
            }
        }
        if (twoHPower > weaponShieldPower) {
            delete bestEquipment['weapon'];
            delete bestEquipment['shield'];
        } else {
            delete bestEquipment['2h'];
        }
        let bestDps = -1;
        let resultingAdditions = {};
        if (skill === 'Melee') {
            // Non-set DPS
            if (bestDps === -1) {
                let equipment_bonus_att = { 'crush': 0, 'slash': 0, 'stab': 0 };
                let equipment_bonus_str = 0;
                Object.keys(bestEquipment).forEach(slot => { equipment_bonus_att['crush'] += chunkInfo['equipment'][bestEquipment[slot]].attack_crush; equipment_bonus_att['slash'] += chunkInfo['equipment'][bestEquipment[slot]].attack_slash; equipment_bonus_att['stab'] += chunkInfo['equipment'][bestEquipment[slot]].attack_stab; equipment_bonus_str += chunkInfo['equipment'][bestEquipment[slot]].melee_strength });
                let maxHit = Math.floor(.5 + (110 * (equipment_bonus_str + 64) / 640));
                let maxAttackRoll = Math.floor(107 * (Math.max(equipment_bonus_att['crush'], equipment_bonus_att['slash'], equipment_bonus_att['stab']) + 64));
                let hitChance = 1 - (578 / (2 * (maxAttackRoll + 1)));
                bestDps = hitChance * (maxHit / 2) / ((bestEquipment.hasOwnProperty('2h') ? chunkInfo['equipment'][bestEquipment['2h']].attack_speed : bestEquipment.hasOwnProperty('weapon') ? chunkInfo['equipment'][bestEquipment['weapon']].attack_speed : 4) * .6);
            }
            // Void Melee
            if (baseChunkData['items'].hasOwnProperty('Void melee helm') && baseChunkData['items'].hasOwnProperty('Void knight top') && baseChunkData['items'].hasOwnProperty('Void knight robe') && baseChunkData['items'].hasOwnProperty('Void knight gloves')) {
                let itemList = ['Void melee helm', 'Void knight top', 'Void knight robe', 'Void knight gloves'];
                let slotMapping = {'head': true, 'body': true, 'legs': true, 'hands': true};
                let allValid = true;
                itemList.forEach(item => {
                    let tempTempValid = false;
                    Object.keys(baseChunkData['items'][item]).forEach(source => {
                        if (!baseChunkData['items'][item][source].includes('-') || !processingSkill[baseChunkData['items'][item][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][item][source].split('-')[1] === 'Slayer') {
                            let article = vowels.includes(item.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = item.toLowerCase().charAt(item.toLowerCase().length - 1) === 's' ? ' ' : article;
                            !backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + item.toLowerCase() + '|~') && (tempTempValid = true);
                        }
                    });
                    if (!tempTempValid) {
                        allValid = false;
                    }
                });
                if (allValid) {
                    let equipment_bonus_att = { 'crush': 0, 'slash': 0, 'stab': 0 };
                    let equipment_bonus_str = 0;
                    Object.keys(bestEquipment).forEach(slot => { if (!slotMapping[slot]) { equipment_bonus_att['crush'] += chunkInfo['equipment'][bestEquipment[slot]].attack_crush; equipment_bonus_att['slash'] += chunkInfo['equipment'][bestEquipment[slot]].attack_slash; equipment_bonus_att['stab'] += chunkInfo['equipment'][bestEquipment[slot]].attack_stab; equipment_bonus_str += chunkInfo['equipment'][bestEquipment[slot]].melee_strength } });
                    itemList.forEach(item => { equipment_bonus_att['crush'] += chunkInfo['equipment'][item].attack_crush; equipment_bonus_att['slash'] += chunkInfo['equipment'][item].attack_slash; equipment_bonus_att['stab'] += chunkInfo['equipment'][item].attack_stab; equipment_bonus_str += chunkInfo['equipment'][item].melee_strength });
                    let maxHit = Math.floor(.5 + (121 * (equipment_bonus_str + 64) / 640));
                    let hitChance = 1 - (578 / (2 * (Math.floor(117.7 * (Math.max(equipment_bonus_att['crush'], equipment_bonus_att['slash'], equipment_bonus_att['stab']) + 64)) + 1)));
                    let newDps = hitChance * (maxHit / 2) / ((bestEquipment.hasOwnProperty('2h') ? chunkInfo['equipment'][bestEquipment['2h']].attack_speed : bestEquipment.hasOwnProperty('weapon') ? chunkInfo['equipment'][bestEquipment['weapon']].attack_speed : 4) * .6);
                    if (newDps > bestDps) {
                        bestDps = newDps;
                        itemList.forEach(item => {
                            resultingAdditions[chunkInfo['equipment'][item].slot] = item;
                        });
                    }
                }
            }
            // Obsidian
            if (baseChunkData['items'].hasOwnProperty('Obsidian helmet') && baseChunkData['items'].hasOwnProperty('Obsidian platebody') && baseChunkData['items'].hasOwnProperty('Obsidian platelegs') && baseChunkData['items'].hasOwnProperty('Toktz-xil-ak')) {
                let itemList = ['Obsidian helmet', 'Obsidian platebody', 'Obsidian platelegs', 'Toktz-xil-ak'];
                let slotMapping = {'head': true, 'body': true, 'legs': true, 'weapon': true};
                let allValid = true;
                itemList.forEach(item => {
                    let tempTempValid = false;
                    Object.keys(baseChunkData['items'][item]).forEach(source => {
                        if (!baseChunkData['items'][item][source].includes('-') || !processingSkill[baseChunkData['items'][item][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][item][source].split('-')[1] === 'Slayer') {
                            let article = vowels.includes(item.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = item.toLowerCase().charAt(item.toLowerCase().length - 1) === 's' ? ' ' : article;
                            !backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + item.toLowerCase() + '|~') && (tempTempValid = true);
                        }
                    });
                    if (!tempTempValid) {
                        allValid = false;
                    }
                });
                if (baseChunkData['items'].hasOwnProperty('Berserker necklace')) {
                    let item = 'Berserker necklace';
                    let tempTempValid = false;
                    Object.keys(baseChunkData['items'][item]).forEach(source => {
                        if (!baseChunkData['items'][item][source].includes('-') || !processingSkill[baseChunkData['items'][item][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][item][source].split('-')[1] === 'Slayer') {
                            let article = vowels.includes(item.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = item.toLowerCase().charAt(item.toLowerCase().length - 1) === 's' ? ' ' : article;
                            !backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + item.toLowerCase() + '|~') && (tempTempValid = true);
                        }
                    });
                    if (tempTempValid) {
                        itemList.push(item);
                        slotMapping['neck'] = true;
                    }
                }
                if (allValid) {
                    let equipment_bonus_att = { 'crush': 0, 'slash': 0, 'stab': 0 };
                    let equipment_bonus_str = 0;
                    Object.keys(bestEquipment).forEach(slot => { if (!slotMapping[slot]) { equipment_bonus_att['crush'] += chunkInfo['equipment'][bestEquipment[slot]].attack_crush; equipment_bonus_att['slash'] += chunkInfo['equipment'][bestEquipment[slot]].attack_slash; equipment_bonus_att['stab'] += chunkInfo['equipment'][bestEquipment[slot]].attack_stab; equipment_bonus_str += chunkInfo['equipment'][bestEquipment[slot]].melee_strength } });
                    itemList.forEach(item => { equipment_bonus_att['crush'] += chunkInfo['equipment'][item].attack_crush; equipment_bonus_att['slash'] += chunkInfo['equipment'][item].attack_slash; equipment_bonus_att['stab'] += chunkInfo['equipment'][item].attack_stab; equipment_bonus_str += chunkInfo['equipment'][item].melee_strength });
                    let maxHit = Math.floor(Math.floor((.5 + (110 * (equipment_bonus_str + 64) / 640))) * (slotMapping['neck'] ? 1.3 : 1.1));
                    let hitChance = 1 - (578 / (2 * ((Math.floor(107 * (Math.max(equipment_bonus_att['crush'], equipment_bonus_att['slash'], equipment_bonus_att['stab']) + 64)) * (slotMapping['neck'] ? 1.3 : 1.1)) + 1)));
                    let newDps = hitChance * (maxHit / 2) / (chunkInfo['equipment']['Toktz-xil-ak'].attack_speed * .6);
                    if (newDps > bestDps) {
                        bestDps = newDps;
                        resultingAdditions = {};
                        itemList.forEach(item => {
                            resultingAdditions[chunkInfo['equipment'][item].slot] = item;
                        });
                    }
                }
            }
        } else if (skill === 'Ranged') {
            // Non-set DPS
            if (bestDps === -1) {
                let equipment_bonus_att = { 'ranged': 0 };
                let equipment_bonus_str = 0;
                Object.keys(bestEquipment).forEach(slot => { equipment_bonus_att['ranged'] += chunkInfo['equipment'][bestEquipment[slot]].attack_ranged; equipment_bonus_str += chunkInfo['equipment'][bestEquipment[slot]].ranged_strength });
                let maxHit = Math.floor(.5 + (110 * (equipment_bonus_str + 64) / 640));
                let maxAttackRoll = Math.floor(107 * (equipment_bonus_att['ranged'] + 64));
                let hitChance = 1 - (578 / (2 * (maxAttackRoll + 1)));
                bestDps = hitChance * (maxHit / 2) / ((bestEquipment.hasOwnProperty('2h') ? chunkInfo['equipment'][bestEquipment['2h']].attack_speed : bestEquipment.hasOwnProperty('weapon') ? chunkInfo['equipment'][bestEquipment['weapon']].attack_speed : 4) * .6);
            }
            // Void Ranged
            if (baseChunkData['items'].hasOwnProperty('Void ranger helm') && baseChunkData['items'].hasOwnProperty('Void knight top') && baseChunkData['items'].hasOwnProperty('Void knight robe') && baseChunkData['items'].hasOwnProperty('Void knight gloves')) {
                let itemList = ['Void ranger helm', 'Void knight top', 'Void knight robe', 'Void knight gloves'];
                let slotMapping = {'head': true, 'body': true, 'legs': true, 'hands': true};
                let allValid = true;
                let elite = false;
                itemList.forEach(item => {
                    let tempTempValid = false;
                    Object.keys(baseChunkData['items'][item]).forEach(source => {
                        if (!baseChunkData['items'][item][source].includes('-') || !processingSkill[baseChunkData['items'][item][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][item][source].split('-')[1] === 'Slayer') {
                            let article = vowels.includes(item.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = item.toLowerCase().charAt(item.toLowerCase().length - 1) === 's' ? ' ' : article;
                            !backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + item.toLowerCase() + '|~') && (tempTempValid = true);
                        }
                    });
                    if (!tempTempValid) {
                        allValid = false;
                    }
                });
                if (baseChunkData['items'].hasOwnProperty('Elite void top')) {
                    let item = 'Elite void top';
                    let tempTempValid = false;
                    Object.keys(baseChunkData['items'][item]).forEach(source => {
                        if (!baseChunkData['items'][item][source].includes('-') || !processingSkill[baseChunkData['items'][item][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][item][source].split('-')[1] === 'Slayer') {
                            let article = vowels.includes(item.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = item.toLowerCase().charAt(item.toLowerCase().length - 1) === 's' ? ' ' : article;
                            !backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + item.toLowerCase() + '|~') && (tempTempValid = true);
                        }
                    });
                    if (tempTempValid) {
                        if (baseChunkData['items'].hasOwnProperty('Elite void robe')) {
                            let item2 = 'Elite void robe';
                            let tempTempTempValid = false;
                            Object.keys(baseChunkData['items'][item2]).forEach(source => {
                                if (!baseChunkData['items'][item2][source].includes('-') || !processingSkill[baseChunkData['items'][item2][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][item2][source].split('-')[1] === 'Slayer') {
                                    let article = vowels.includes(item2.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                                    article = item2.toLowerCase().charAt(item2.toLowerCase().length - 1) === 's' ? ' ' : article;
                                    !backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + item2.toLowerCase() + '|~') && (tempTempTempValid = true);
                                }
                            });
                            if (tempTempTempValid) {
                                let index = itemList.indexOf('Void knight top');
                                if (index > -1) {
                                    itemList.splice(index, 1);
                                }
                                index = itemList.indexOf('Void knight robe');
                                if (index > -1) {
                                    itemList.splice(index, 1);
                                }
                                itemList.push(item);
                                itemList.push(item2);
                                elite = true;
                            }
                        }
                    }
                }
                if (allValid) {
                    let equipment_bonus_att = { 'ranged': 0 };
                    let equipment_bonus_str = 0;
                    Object.keys(bestEquipment).forEach(slot => { if (!slotMapping[slot]) { equipment_bonus_att['ranged'] += chunkInfo['equipment'][bestEquipment[slot]].attack_ranged; equipment_bonus_str += chunkInfo['equipment'][bestEquipment[slot]].ranged_strength } });
                    itemList.forEach(item => { equipment_bonus_att['ranged'] += chunkInfo['equipment'][item].attack_ranged; equipment_bonus_str += chunkInfo['equipment'][item].ranged_strength });
                    let maxHit = Math.floor(.5 + ((elite ? 123.75 : 121) * (equipment_bonus_str + 64) / 640));
                    let hitChance = 1 - (578 / (2 * (Math.floor((elite ? 120.375 : 117.7) * (equipment_bonus_att['ranged'] + 64)) + 1)));
                    let newDps = hitChance * (maxHit / 2) / ((bestEquipment.hasOwnProperty('2h') ? chunkInfo['equipment'][bestEquipment['2h']].attack_speed : bestEquipment.hasOwnProperty('weapon') ? chunkInfo['equipment'][bestEquipment['weapon']].attack_speed : 4) * .6);
                    if (newDps > bestDps) {
                        bestDps = newDps;
                        itemList.forEach(item => {
                            resultingAdditions[chunkInfo['equipment'][item].slot] = item;
                        });
                    }
                }
            }
            // Crystal
            if (baseChunkData['items'].hasOwnProperty('Crystal helm') && baseChunkData['items'].hasOwnProperty('Crystal body') && baseChunkData['items'].hasOwnProperty('Crystal legs') && baseChunkData['items'].hasOwnProperty('Crystal bow')) {
                let itemList = ['Crystal helm', 'Crystal body', 'Crystal legs', 'Crystal bow'];
                let slotMapping = {'head': true, 'body': true, 'legs': true, '2h': true};
                let allValid = true;
                let weapon = 'Crystal bow';
                itemList.forEach(item => {
                    let tempTempValid = false;
                    Object.keys(baseChunkData['items'][item]).forEach(source => {
                        if (!baseChunkData['items'][item][source].includes('-') || !processingSkill[baseChunkData['items'][item][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][item][source].split('-')[1] === 'Slayer') {
                            let article = vowels.includes(item.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = item.toLowerCase().charAt(item.toLowerCase().length - 1) === 's' ? ' ' : article;
                            !backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + item.toLowerCase() + '|~') && (tempTempValid = true);
                        }
                    });
                    if (!tempTempValid) {
                        allValid = false;
                    }
                });
                if (baseChunkData['items'].hasOwnProperty('Bow of faerdhinen')) {
                    let item2 = 'Bow of faerdhinen';
                    let tempTempTempValid = false;
                    Object.keys(baseChunkData['items'][item2]).forEach(source => {
                        if (!baseChunkData['items'][item2][source].includes('-') || !processingSkill[baseChunkData['items'][item2][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][item2][source].split('-')[1] === 'Slayer') {
                            let article = vowels.includes(item2.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = item2.toLowerCase().charAt(item2.toLowerCase().length - 1) === 's' ? ' ' : article;
                            !backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + item2.toLowerCase() + '|~') && (tempTempTempValid = true);
                        }
                    });
                    if (tempTempTempValid) {
                        let index = itemList.indexOf('Crystal bow');
                        if (index > -1) {
                            itemList.splice(index, 1);
                        }
                        itemList.push(item2);
                        weapon = 'Bow of faerdhinen';
                    }
                }
                if (allValid) {
                    let equipment_bonus_att = { 'ranged': 0 };
                    let equipment_bonus_str = 0;
                    Object.keys(bestEquipment).forEach(slot => { if (!slotMapping[slot]) { equipment_bonus_att['ranged'] += chunkInfo['equipment'][bestEquipment[slot]].attack_ranged; equipment_bonus_str += chunkInfo['equipment'][bestEquipment[slot]].ranged_strength } });
                    itemList.forEach(item => { equipment_bonus_att['ranged'] += chunkInfo['equipment'][item].attack_ranged; equipment_bonus_str += chunkInfo['equipment'][item].ranged_strength });
                    let maxHit = Math.floor(Math.floor((.5 + (110 * (equipment_bonus_str + 64) / 640))) * 1.15);
                    let hitChance = 1 - (578 / (2 * ((Math.floor(107 * (equipment_bonus_att['ranged'] + 64)) * 1.3) + 1)));
                    let newDps = hitChance * (maxHit / 2) / (chunkInfo['equipment'][weapon].attack_speed * .6);
                    if (newDps > bestDps) {
                        bestDps = newDps;
                        resultingAdditions = {};
                        itemList.forEach(item => {
                            resultingAdditions[chunkInfo['equipment'][item].slot] = item;
                        });
                    }
                }
            }
        } else if (skill === 'Magic') {
            // Non-set DPS
            if (bestDps === -1) {
                let equipment_bonus_att = { 'magic': 0 };
                let equipment_bonus_str = 0;
                Object.keys(bestEquipment).forEach(slot => { equipment_bonus_att['magic'] += chunkInfo['equipment'][bestEquipment[slot]].attack_magic; equipment_bonus_str += chunkInfo['equipment'][bestEquipment[slot]].magic_damage });
                let maxHit = Math.floor(.5 + (110 * (equipment_bonus_str + 64) / 640));
                let maxAttackRoll = Math.floor(107 * (equipment_bonus_att['magic'] + 64));
                let hitChance = 1 - (578 / (2 * (maxAttackRoll + 1)));
                bestDps = hitChance * (maxHit / 2) / ((bestEquipment.hasOwnProperty('2h') ? chunkInfo['equipment'][bestEquipment['2h']].attack_speed : bestEquipment.hasOwnProperty('weapon') ? chunkInfo['equipment'][bestEquipment['weapon']].attack_speed : 4) * .6);
            }
            // Void Magic
            if (baseChunkData['items'].hasOwnProperty('Void mage helm') && baseChunkData['items'].hasOwnProperty('Void knight top') && baseChunkData['items'].hasOwnProperty('Void knight robe') && baseChunkData['items'].hasOwnProperty('Void knight gloves')) {
                let itemList = ['Void mage helm', 'Void knight top', 'Void knight robe', 'Void knight gloves'];
                let slotMapping = {'head': true, 'body': true, 'legs': true, 'hands': true};
                let allValid = true;
                let elite = false;
                itemList.forEach(item => {
                    let tempTempValid = false;
                    Object.keys(baseChunkData['items'][item]).forEach(source => {
                        if (!baseChunkData['items'][item][source].includes('-') || !processingSkill[baseChunkData['items'][item][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][item][source].split('-')[1] === 'Slayer') {
                            let article = vowels.includes(item.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = item.toLowerCase().charAt(item.toLowerCase().length - 1) === 's' ? ' ' : article;
                            !backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + item.toLowerCase() + '|~') && (tempTempValid = true);
                        }
                    });
                    if (!tempTempValid) {
                        allValid = false;
                    }
                });
                if (baseChunkData['items'].hasOwnProperty('Elite void top')) {
                    let item = 'Elite void top';
                    let tempTempValid = false;
                    Object.keys(baseChunkData['items'][item]).forEach(source => {
                        if (!baseChunkData['items'][item][source].includes('-') || !processingSkill[baseChunkData['items'][item][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][item][source].split('-')[1] === 'Slayer') {
                            let article = vowels.includes(item.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                            article = item.toLowerCase().charAt(item.toLowerCase().length - 1) === 's' ? ' ' : article;
                            !backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + item.toLowerCase() + '|~') && (tempTempValid = true);
                        }
                    });
                    if (tempTempValid) {
                        if (baseChunkData['items'].hasOwnProperty('Elite void robe')) {
                            let item2 = 'Elite void robe';
                            let tempTempTempValid = false;
                            Object.keys(baseChunkData['items'][item2]).forEach(source => {
                                if (!baseChunkData['items'][item2][source].includes('-') || !processingSkill[baseChunkData['items'][item2][source].split('-')[1]] || rules['Wield Crafted Items'] || baseChunkData['items'][item2][source].split('-')[1] === 'Slayer') {
                                    let article = vowels.includes(item2.toLowerCase().charAt(0)) ? ' an ' : ' a ';
                                    article = item2.toLowerCase().charAt(item2.toLowerCase().length - 1) === 's' ? ' ' : article;
                                    !backlog['BiS'] || !backlog['BiS'].hasOwnProperty('Obtain' + article + '~|' + item2.toLowerCase() + '|~') && (tempTempTempValid = true);
                                }
                            });
                            if (tempTempTempValid) {
                                let index = itemList.indexOf('Void knight top');
                                if (index > -1) {
                                    itemList.splice(index, 1);
                                }
                                index = itemList.indexOf('Void knight robe');
                                if (index > -1) {
                                    itemList.splice(index, 1);
                                }
                                itemList.push(item);
                                itemList.push(item2);
                                elite = true;
                            }
                        }
                    }
                }
                if (allValid) {
                    let equipment_bonus_att = { 'magic': 0 };
                    let equipment_bonus_str = 0;
                    Object.keys(bestEquipment).forEach(slot => { if (!slotMapping[slot]) { equipment_bonus_att['magic'] += chunkInfo['equipment'][bestEquipment[slot]].attack_magic; equipment_bonus_str += chunkInfo['equipment'][bestEquipment[slot]].magic_damage } });
                    itemList.forEach(item => { equipment_bonus_att['magic'] += chunkInfo['equipment'][item].attack_magic; equipment_bonus_str += chunkInfo['equipment'][item].magic_damage });
                    let maxHit = Math.floor(.5 + (110 * (equipment_bonus_str + 64) / 640));
                    let hitChance = 1 - (578 / (2 * (Math.floor((elite ? 155.15 : 157.825) * (equipment_bonus_att['magic'] + 64)) + 1)));
                    let newDps = hitChance * (maxHit / 2) / ((bestEquipment.hasOwnProperty('2h') ? chunkInfo['equipment'][bestEquipment['2h']].attack_speed : bestEquipment.hasOwnProperty('weapon') ? chunkInfo['equipment'][bestEquipment['weapon']].attack_speed : 4) * .6);
                    if (newDps > bestDps) {
                        bestDps = newDps;
                        itemList.forEach(item => {
                            resultingAdditions[chunkInfo['equipment'][item].slot] = item;
                        });
                    }
                }
            }
        }
        Object.keys(resultingAdditions).forEach(slot => {
            bestEquipment[slot] = resultingAdditions[slot];
        });
        Object.keys(bestEquipment).forEach(slot => {
            if (slot === '2h') {
                highestOverall[skill.replaceAll(' ', '_') + '-weapon'] = bestEquipment[slot];
                highestOverall[skill.replaceAll(' ', '_') + '-shield'] = 'N/A';
            } else {
                highestOverall[skill.replaceAll(' ', '_') + '-' + slot] = bestEquipment[slot];
            }
            let article = vowels.includes(bestEquipment[slot].toLowerCase().charAt(0)) ? ' an ' : ' a ';
            article = bestEquipment[slot].toLowerCase().charAt(bestEquipment[slot].toLowerCase().length - 1) === 's' ? ' ' : article;
            if (!!globalValids['BiS']['Obtain' + article + '~|' + bestEquipment[slot].toLowerCase() + '|~']) {
                globalValids['BiS']['Obtain' + article + '~|' + bestEquipment[slot].toLowerCase() + '|~'] = skill + '/' + globalValids['BiS']['Obtain' + article + '~|' + bestEquipment[slot].toLowerCase() + '|~'];
            } else {
                globalValids['BiS']['Obtain' + article + '~|' + bestEquipment[slot].toLowerCase() + '|~'] = skill + ' BiS ' + slot;
            }
            if (!chunkInfo['challenges']['BiS']) {
                chunkInfo['challenges']['BiS'] = {};
            }
            if (!!chunkInfo['challenges']['BiS']['Obtain' + article + '~|' + bestEquipment[slot].toLowerCase() + '|~'] && notFresh['Obtain' + article + '~|' + bestEquipment[slot].toLowerCase() + '|~']) {
                chunkInfo['challenges']['BiS']['Obtain' + article + '~|' + bestEquipment[slot].toLowerCase() + '|~'] = {
                    'ItemsDetails': [bestEquipment[slot]],
                    'Label': `<span class='noscroll ${skill}-bis-highlight'>` + skill + '</span>/' + chunkInfo['challenges']['BiS']['Obtain' + article + '~|' + bestEquipment[slot].toLowerCase() + '|~']['Label']
                }
            } else {
                chunkInfo['challenges']['BiS']['Obtain' + article + '~|' + bestEquipment[slot].toLowerCase() + '|~'] = {
                    'ItemsDetails': [bestEquipment[slot]],
                    'Label': `<span class='noscroll ${skill}-bis-highlight'>` + skill + '</span> BiS ' + slot
                }
                notFresh['Obtain' + article + '~|' + bestEquipment[slot].toLowerCase() + '|~'] = true;
            }
        });
        //console.log(bestEquipment);
    });
}

var calcCurrentChallenges2 = function() {
    let tempChallengeArr = {};
    let highestChallenge = {};
    let highestChallengeLevelArr = {};

    Object.keys(globalValids).forEach(skill => {
        if (skill !== 'Extra' && skill !== 'Quest' && skill !== 'Diary' && skill !== 'BiS') {
            highestChallengeLevelArr[skill] = 0;
            !!completedChallenges[skill] && Object.keys(completedChallenges[skill]).forEach(name => {
                if (chunkInfo['challenges'][skill].hasOwnProperty(name) && chunkInfo['challenges'][skill][name]['Level'] > highestChallengeLevelArr[skill]) {
                    highestChallengeLevelArr[skill] = chunkInfo['challenges'][skill][name]['Level'];
                    highestOverall[skill] = name;
                }
            });
            checkPrimaryMethod(skill, globalValids, baseChunkData) && Object.keys(globalValids[skill]).forEach(challenge => {
                if (globalValids[skill][challenge] !== false && (chunkInfo['challenges'][skill][challenge]['Level'] > highestChallengeLevelArr[skill])) {
                    if (((!highestChallenge[skill] || (chunkInfo['challenges'][skill][challenge]['Level'] > chunkInfo['challenges'][skill][highestChallenge[skill]]['Level'])) || ((!highestChallenge[skill] || (chunkInfo['challenges'][skill][challenge]['Level'] === chunkInfo['challenges'][skill][highestChallenge[skill]]['Level'])) && (!highestChallenge[skill] || !chunkInfo['challenges'][skill][highestChallenge[skill]]['Priority'] || (!!chunkInfo['challenges'][skill][challenge]['Priority'] && chunkInfo['challenges'][skill][challenge]['Priority'] < chunkInfo['challenges'][skill][highestChallenge[skill]]['Priority'])))) && (!backlog[skill] || !backlog[skill].hasOwnProperty(challenge))) {
                        if (!!chunkInfo['challenges'][skill][challenge]['Skills']) {
                            let tempValid = true;
                            Object.keys(chunkInfo['challenges'][skill][challenge]['Skills']).forEach(subSkill => {
                                if (!checkPrimaryMethod(subSkill, globalValids, baseChunkData)) {
                                    tempValid = false;
                                }
                            });
                            if (tempValid) {
                                highestChallenge[skill] = challenge;
                            }
                        } else {
                            highestChallenge[skill] = challenge;
                        }
                    } else if ((!highestChallenge[skill] || (chunkInfo['challenges'][skill][challenge]['Level'] === chunkInfo['challenges'][skill][highestChallenge[skill]]['Level'])) && (!highestChallenge[skill] || (chunkInfo['challenges'][skill][challenge]['Priority'] === chunkInfo['challenges'][skill][highestChallenge[skill]]['Priority'])) && chunkInfo['challenges'][skill][challenge]['Primary'] && (!backlog[skill] || !backlog[skill].hasOwnProperty(challenge))) {
                        if (!!chunkInfo['challenges'][skill][challenge]['Skills']) {
                            let tempValid = true;
                            Object.keys(chunkInfo['challenges'][skill][challenge]['Skills']).forEach(subSkill => {
                                if (!checkPrimaryMethod(subSkill, globalValids, baseChunkData)) {
                                    tempValid = false;
                                }
                            });
                            if (tempValid) {
                                highestChallenge[skill] = challenge;
                            }
                        } else {
                            highestChallenge[skill] = challenge;
                        }
                    }
                }
            });
            (!highestChallenge[skill] || !chunkInfo['challenges'][skill][highestChallenge[skill]] || (chunkInfo['challenges'][skill][highestChallenge[skill]]['Level'] <= 1 && !chunkInfo['challenges'][skill][highestChallenge[skill]]['Primary'])) && (highestChallenge[skill] = undefined);
            tempChallengeArr[skill] = highestChallenge[skill];
            highestCurrent[skill] = highestChallenge[skill];
            if (!!highestChallenge[skill] && !!chunkInfo['challenges'][skill][highestChallenge[skill]] && !!chunkInfo['challenges'][skill][highestChallenge[skill]]['Skills']) {
                Object.keys(chunkInfo['challenges'][skill][highestChallenge[skill]]['Skills']).forEach(subSkill => {
                    if ((!highestChallenge[subSkill] || chunkInfo['challenges'][subSkill][highestChallenge[subSkill]]['Level'] < chunkInfo['challenges'][skill][highestChallenge[skill]]['Skills'][subSkill]) && Object.keys(chunkInfo['challenges'][subSkill]).length > 0 && chunkInfo['challenges'][skill][highestChallenge[skill]]['Skills'][subSkill] > highestChallengeLevelArr[subSkill]) {
                        highestChallenge[subSkill] = highestChallenge[skill];
                        tempChallengeArr[subSkill] = highestChallenge[subSkill];
                        highestCurrent[subSkill] = highestChallenge[subSkill];
                    }
                });
            }
        } else {
            Object.keys(globalValids[skill]).forEach(challenge => {
                if (!!chunkInfo['challenges'][skill][challenge]['Skills']) {
                    let tempValid = true;
                    Object.keys(chunkInfo['challenges'][skill][challenge]['Skills']).forEach(subSkill => {
                        if (!checkPrimaryMethod(subSkill, globalValids, baseChunkData)) {
                            tempValid = false;
                        }
                    });
                    if (!tempValid) {
                        delete globalValids[skill][challenge];
                    }
                }
            });
        }
    });
    Object.keys(tempChallengeArr).forEach(skill => {
        if (!!tempChallengeArr[skill]) {
            highestOverall[skill] = tempChallengeArr[skill];
        }
    });
    return tempChallengeArr;
}

var gcd = function(a, b) {
    if (b < 0.0000001) return a;

    return gcd(b, Math.floor(a % b));
};
  
var findFraction = function(fraction) {
    var len = fraction.toString().length - 2;

    var denominator = Math.pow(10, len);
    var numerator = fraction * denominator;

    var divisor = gcd(numerator, denominator);

    numerator /= divisor;
    denominator /= divisor;
    return 1 + '/' + (+(Math.round((denominator/numerator) + "e+2")  + "e-2")).toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

// Gathers item/object info on all chunk ids passed in
var gatherChunksInfo = function(chunks) {
    let items = {};
    let objects = {};
    let monsters = {};
    let npcs = {};

    !!randomLoot && Object.keys(randomLoot).forEach(item => {
        if (!items[item]) {
            items[item] = {};
        }
        items[item]['Random Event Loot'] = 'secondary-drop';
    });

    !!manualEquipment && Object.keys(manualEquipment).forEach(item => {
        if (!items[item]) {
            items[item] = {};
        }
        items[item]['Manually Added Equipment'] = 'secondary-drop';
    });

    Object.keys(chunks).forEach(num => {
        if (rules['Puro-Puro'] || num !== 'Puro-Puro') {
            !!chunkInfo['chunks'][num] && !!chunkInfo['chunks'][num]['Monster'] && Object.keys(chunkInfo['chunks'][num]['Monster']).forEach(monster => {
                !!chunkInfo['drops'][monster] && Object.keys(chunkInfo['drops'][monster]).forEach(drop => {
                    if (!!dropTables[drop] && ((drop !== 'RareDropTable+' && drop !== 'GemDropTable+') || rules['RDT'])) {
                        Object.keys(dropTables[drop]).forEach(item => {
                            if ((rules['Rare Drop'] || isNaN(parseFloat(chunkInfo['drops'][monster][drop].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['drops'][monster][drop].split('/')[1])) || ((parseFloat(chunkInfo['drops'][monster][drop].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['drops'][monster][drop].split('/')[1]) * parseFloat(dropTables[drop][item].split('/')[0].replaceAll('~', '')) / parseFloat(dropTables[drop][item].split('/')[1]))) > (parseFloat(rareDropNum.split('/')[0].replaceAll('~', '')) / parseFloat(rareDropNum.split('/')[1]))) &&
                                (rules['Boss'] || !bossMonsters.hasOwnProperty(monster))) {
                                if (!items[item]) {
                                    items[item] = {};
                                }
                                if (chunkInfo['drops'][monster][item] === 'Always') {
                                    items[item][monster.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')] = 'primary-drop';
                                } else {
                                    items[item][monster.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')] = 'secondary-drop';
                                }
                                if (!dropRatesGlobal[monster]) {
                                    dropRatesGlobal[monster] = {};
                                }
                                dropRatesGlobal[monster][item] = findFraction(parseFloat(chunkInfo['drops'][monster][drop].split('/')[0].replaceAll('~', '') * dropTables[drop][item].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['drops'][monster][drop].split('/')[1] * dropTables[drop][item].split('/')[1].replaceAll('~', '')));
                            }
                        });
                    } else if ((rules['Rare Drop'] || isNaN(parseFloat(chunkInfo['drops'][monster][drop].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['drops'][monster][drop].split('/')[1])) || (parseFloat(chunkInfo['drops'][monster][drop].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['drops'][monster][drop].split('/')[1])) > (parseFloat(rareDropNum.split('/')[0].replaceAll('~', '')) / parseFloat(rareDropNum.split('/')[1]))) &&
                            (rules['Boss'] || !bossMonsters.hasOwnProperty(monster))) {
                        if (!items[drop]) {
                            items[drop] = {};
                        }
                        if (chunkInfo['drops'][monster][drop] === 'Always') {
                            items[drop][monster.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')] = 'primary-drop';
                        } else {
                            items[drop][monster.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')] = 'secondary-drop';
                        }
                        if (!dropRatesGlobal[monster]) {
                            dropRatesGlobal[monster] = {};
                        }
                        dropRatesGlobal[monster][drop] = (chunkInfo['drops'][monster][drop].split('/').length <= 1) ? chunkInfo['drops'][monster][drop] : findFraction(parseFloat(chunkInfo['drops'][monster][drop].split('/')[0].replaceAll('~', '')) / parseFloat(chunkInfo['drops'][monster][drop].split('/')[1].replaceAll('~', '')));
                    }
                });
            });

            !!chunkInfo['chunks'][num] && !!chunkInfo['chunks'][num]['Shop'] && Object.keys(chunkInfo['chunks'][num]['Shop']).forEach(shop => {
                !!chunkInfo['shopItems'][shop] && Object.keys(chunkInfo['shopItems'][shop]).forEach(item => {
                    if (!minigameShops[shop] || rules['Minigame']) {
                        if (!items[item]) {
                            items[item] = {};
                        }
                        items[item][shop.replaceAll(/\%2E/g, '.').replaceAll(/\%2F/g, '#').replaceAll(/\%2G/g, '/')] = 'shop';
                    }
                });
            });

            !!chunkInfo['chunks'][num] && !!chunkInfo['chunks'][num]['Spawn'] && Object.keys(chunkInfo['chunks'][num]['Spawn']).forEach(spawn => {
                if (!items[spawn]) {
                    items[spawn] = {};
                }
                items[spawn][num] = rules['Primary Spawns'] ? 'primary-spawn' : 'secondary-spawn';
            });

            !!chunkInfo['chunks'][num] && !!chunkInfo['chunks'][num]['Object'] && Object.keys(chunkInfo['chunks'][num]['Object']).forEach(object => {
                if (!objects[object]) {
                    objects[object] = {};
                }
                objects[object][num] = true;
            });

            !!chunkInfo['chunks'][num] && !!chunkInfo['chunks'][num]['Monster'] && Object.keys(chunkInfo['chunks'][num]['Monster']).forEach(monster => {
                if (!monsters[monster]) {
                    monsters[monster] = {};
                }
                monsters[monster][num] = true;
            });
            !!chunkInfo['chunks'][num] && !!chunkInfo['chunks'][num]['NPC'] && Object.keys(chunkInfo['chunks'][num]['NPC']).forEach(npc => {
                if (!npcs[npc]) {
                    npcs[npc] = {};
                }
                npcs[npc][num] = true;
            });
        }
    });
    return {items: items, objects: objects, monsters: monsters, npcs: npcs};
}

var getChunkAreas = function(chunks) {
    let i = 0;
    let temp = {};
    let temp2 = {};
    while (i < Object.keys(chunks).length) {
        !!chunkInfo['chunks'][Object.keys(chunks)[i]] && !!chunkInfo['chunks'][Object.keys(chunks)[i]]['Connect'] && Object.keys(chunkInfo['chunks'][Object.keys(chunks)[i]]['Connect']).forEach(id => {
            if (!!chunkInfo['chunks'][parseInt(id)]['Name'] && possibleAreas[chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')] && !chunks[chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')]) {
                chunks[chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')] = true;
                temp[chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')] = possibleAreas[chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')] || false;
                if (!!possibleAreas[Object.keys(chunks)[i]]) {
                    if (!temp2[Object.keys(chunks)[i]] || !temp2[Object.keys(chunks)[i]][chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')]) {
                        if (!temp2[chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')]) {
                            temp2[chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')] = {};
                        }
                        let depth = 1;
                        temp2[chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')][Object.keys(chunks)[i]] = true;
                    }
                }
            } else if (!!chunkInfo['chunks'][parseInt(id)]['Name']) {
                temp[chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')] = possibleAreas[chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')] || false;
                if (!!possibleAreas[Object.keys(chunks)[i]]) {
                    if (!temp2[Object.keys(chunks)[i]] || !temp2[Object.keys(chunks)[i]][chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')]) {
                        if (!temp2[chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')]) {
                            temp2[chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')] = {};
                        }
                        temp2[chunkInfo['chunks'][parseInt(id)]['Name'].replaceAll(/\./g, '%2E').replaceAll(/\#/g, '%2F').replaceAll(/\//g, '%2G')][Object.keys(chunks)[i]] = true;
                    }
                }
            }
        });
        i++;
    }
    possibleAreas = temp;
    areasStructure = temp2;
    return chunks;
}