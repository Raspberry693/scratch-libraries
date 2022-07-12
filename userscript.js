// DOM references
const projectInput = document.getElementById('projectId');
const targetDiv = document.getElementById('targets');
const scriptsDiv = document.getElementById('scripts');

// fetch project.json
async function pullParse(id) {
    return (await fetch("https://projects.scratch.mit.edu/"+id+"/get")).json();
}

// script for when input updates
function forIdInput() {
    // checks if input is empty or not
    if (projectInput.value) {
        // pulls data from project.json
        pullParse(projectInput.value).then(function (result) {
            // reset all of div#targets
            while (targetDiv.hasChildNodes()) {
                targetDiv.removeChild(targetDiv.firstChild);
            }

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
                    // insert block svgs
                    let blocksArray = Object.keys(result.targets[selected].blocks);
                    let hatBlock;
                    let hatBlockText;
                    let hatBlockTextNew='define ';
                    for (let i=0;i<blocksArray.length;i++) {
                        if (result.targets[selected].blocks[blocksArray[i]].opcode=='procedures_prototype') {
                            hatBlock=document.createElement('p');
                            hatBlockText=result.targets[selected].blocks[blocksArray[i]].mutation.proccode;
                            let timesReplaced=0;
                            let argNames = result.targets[selected].blocks[blocksArray[i]].mutation.argumentnames.split(',');
                            console.log(result.targets[selected].blocks[blocksArray[i]].mutation.argumentnames);
                            for (let i=0;i<hatBlockText.length;i++) {
                                if (hatBlockText.charAt(i)=='%') {
                                    if (hatBlockText.charAt(i+1)=='s') {
                                        hatBlockTextNew += '['+argNames[timesReplaced].replace(/"|\[|\]/g, '')+']';
                                        timesReplaced++;
                                        i++;
                                    } else {
                                        hatBlockTextNew += '<'+argNames[timesReplaced].replace(/"|\[|\]/g, '')+'>';
                                        timesReplaced++;
                                        i++;
                                    }
                                } else {
                                    hatBlockTextNew += hatBlockText.charAt(i);
                                }
                            }
                            hatBlock.innerText=hatBlockTextNew;
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