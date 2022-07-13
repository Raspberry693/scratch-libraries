// DOM references
const projectInput = document.getElementById('projectId');
const targetDiv = document.getElementById('targets');
const scriptsDiv = document.getElementById('scripts');
const warn = document.getElementById('warning');

// fetch project.json
async function pullParse(id) {
    return (await fetch("https://projects.scratch.mit.edu/"+id+"/get")).json();
}
// fetch project social data
async function pullSocial(id) {
    return await fetch('https://cors-anywhere.herokuapp.com/https://api.scratch.mit.edu/projects/'+id);
}

// script for when input updates
function forIdInput() {
    
    // checks if input is empty or not
    if (projectInput.value) {
        // pulls social data from Scratch API
        pullSocial(projectInput.value).then(function (result) {
            let json=result.json();
            let created=new Date(json.history.created);
            let release=new Date('2019-01-01 T 00:00:00.000 Z');
            if (created<release) {
                warn.style.display('flex');
            } else {
                warn.style.display('none');
            }
        });

        // pulls data from project.json
        pullParse(projectInput.value).then(function (result) {
            // reset all of div#targets
            while (targetDiv.hasChildNodes()) {
                targetDiv.removeChild(targetDiv.firstChild);
            }

            // declare some vars for the DOM
            let targetButton;
            let selected=0;
            // insert sprite tabs
            for (let i=0;i<result.targets.length;i++) {
                targetButton = document.createElement('button');
                targetButton.innerText = result.targets[i].name;
                targetButton.classList.add('target-button');
                // default first to be inserted as active
                if (i==0) {
                    targetButton.classList.add('active');
                }
                targetButton.id = i;
                // when clicked set as .active and clear all other elements' class of .active
                targetButton.addEventListener('click', function() {
                    selected = this.id;
                    document.querySelector('.active').classList.remove('active');
                    this.classList.add('active');
                    // clear div#scripts
                    while (scriptsDiv.hasChildNodes()) {
                        scriptsDiv.removeChild(scriptsDiv.firstChild);
                    }
                    // declare/reset variables
                    let blocksArray = Object.keys(result.targets[selected].blocks);
                    let hatBlock;
                    let hatBlockText;
                    let hatBlockTextNew='define ';
                    let argNames=[];
                    var checkbox;
                    // loop through different blocks in a sprite
                    for (let i=0;i<blocksArray.length;i++) {
                        // if the noticed block is of the correct id
                        if (result.targets[selected].blocks[blocksArray[i]].opcode=='procedures_prototype') {
                            hatBlock=document.createElement('p');
                            checkbox=document.createElement('input');
                            // set attr for checkbox
                            checkbox.id=result.targets[selected].blocks[blocksArray[i]].parent;
                            console.log(result.targets[selected].blocks[blocksArray[i]].parent);
                            checkbox.type='checkbox';
                            // set hatBlockText to a string for editing
                            hatBlockText=result.targets[selected].blocks[blocksArray[i]].mutation.proccode;
                            timesReplaced=0;
                            // different arguments in a custom block
                            argNames=result.targets[selected].blocks[blocksArray[i]].mutation.argumentnames.split(',');
                            hatBlockTextNew='';
                            // loop through and start changing the text
                            for (let i=0;i<hatBlockText.length;i++) {
                                // if the noticed char is a %
                                if (hatBlockText.charAt(i)=='%') {
                                    // if it is %s
                                    if (hatBlockText.charAt(i+1)=='s'||hatBlockText.charAt(i+1)=='n') {
                                        // replace and setup for scratchblocks
                                        hatBlockTextNew += '['+argNames[timesReplaced].replace(/"|\[|\]/g, '')+']';
                                        timesReplaced++;
                                        i++;
                                    // if it is %b
                                    } else {
                                        // replace and setup for scratchblocks
                                        hatBlockTextNew += '<'+argNames[timesReplaced].replace(/"|\[|\]/g, '')+'>';
                                        timesReplaced++;
                                        i++;
                                    }
                                } else {
                                    // append the last noticed character
                                    hatBlockTextNew += hatBlockText.charAt(i);
                                }
                            }
                            hatBlock.innerText=hatBlockTextNew;
                            scriptsDiv.appendChild(checkbox);
                            scriptsDiv.appendChild(hatBlock);
                        }
                    }
                });
                // append sprite tab
                targetDiv.appendChild(targetButton);
            }
        });
    } else {

        // clear all of div#targets
        while (targetDiv.hasChildNodes()) {
            targetDiv.removeChild(targetDiv.firstChild);
        }

        // insert empty message
        let errorMessage = document.createElement('p');
        errorMessage.innerText='Whoops! Nothing here...';
        targetDiv.appendChild(errorMessage);
    }
}