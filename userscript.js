// DOM references
const dynamic = document.createElement('div');

// set up the screens
var screen=0;
const inputWrap=document.createElement('div');
const projectInput=document.createElement('input');
const targetDiv=document.createElement('div');
const scriptsDiv=document.createElement('div');

// set up dynamic wrapper for screen
dynamic.id='dynamic-content';
document.getElementById('modal').appendChild(dynamic);

// set up nav button wrapper
const buttonWrapper=document.createElement('div');
buttonWrapper.id='modal-nav-wrapper';
document.getElementById('modal').appendChild(buttonWrapper);
// set up back button
const backButton=document.createElement('button');
backButton.innerText='Back';
backButton.id='modal-nav-back';
backButton.className='nav-button';
buttonWrapper.appendChild(backButton);
backButton.addEventListener('click', function() {
    if (screen>0) {
        screen--;
        screenChange(screen);
    }
});
// set up next button
const nextButton=document.createElement('button');
nextButton.innerText='Next';
nextButton.id='modal-nav-next';
nextButton.className='nav-button active';
buttonWrapper.appendChild(nextButton);
nextButton.addEventListener('click', function() {
    if (screen<2) {
        screen++;
        screenChange(screen);
    }
});

var projectId;

// screen scripts
function screenChange(screen) {
    // delete all of the dynamic children
    for (let i=0;dynamic.hasChildNodes();i++) {
        dynamic.removeChild(dynamic.firstChild);
    }
    if (screen==0) {
        // inject input and wrapper
        inputWrap.id='input-wrapper';
        projectInput.id='projectID';
        projectInput.setAttribute('placeholder', 'Project ID');
        projectInput.setAttribute('type', 'text');
        inputWrap.appendChild(projectInput);
        dynamic.appendChild(inputWrap);
        projectInput.addEventListener('change', function() {
            projectId=this.value;
            projectId=projectId.replace('https://','');
            projectId=projectId.replace('http://','');
            projectId=projectId.replace('scratch.mit.edu/','');
            projectId=projectId.replace('projects','');
            projectId=projectId.replace('/','');
        });
    } else if (screen==1) {
        // inject targets wrapper
        targetDiv.id='targets';
        dynamic.appendChild(targetDiv);
        // inject scripts wrapper
        scriptsDiv.id='scripts'
        dynamic.appendChild(scriptsDiv);

        // call for the main script to run
        forIdInput();
    }
}

// fetch project.json
async function pullParse(id) {
    return (await fetch("https://projects.scratch.mit.edu/"+id+"/get")).json();
}
var selected;
// script for when input updates
function forIdInput() {
    // checks if input is empty or not
    if (projectId&&screen==1) {
        // pulls data from project.json
        pullParse(projectId).then(function (result) {
            // reset all of div#targets
            while (targetDiv.hasChildNodes()) {
                targetDiv.removeChild(targetDiv.firstChild);
            }
            // clear div#scripts
            while (scriptsDiv.hasChildNodes()) {
                scriptsDiv.removeChild(scriptsDiv.firstChild);
            }

            // declare some vars for the DOM
            let targetButton;
            selected=0;
            // insert sprite tabs
            for (let i=0;i<result.targets.length;i++) {
                targetButton = document.createElement('button');
                targetButton.innerText = result.targets[i].name;
                targetButton.classList.add('target-button');
                // default first to be inserted as active
                if (i==0) {
                    targetButton.classList.add('active');
                }
                targetButton.id = 'target-'+i;
                // when clicked set as .active and clear all other elements' class of .active
                targetButton.addEventListener('click', function() {
                    selected = i;
                    document.querySelector('.active').classList.remove('active');
                    this.classList.add('active');
                });
                // append sprite tab
                targetDiv.appendChild(targetButton);
                // append script tab
                setScriptWrappers(result, i);
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

// declare vars for setScriptWrappers()
let blocksArray;
let hatBlock;
let hatBlockText;
let hatBlockTextNew;
let argNames;
let checkbox;
let blockWrapper;
let targetScripts;
let toImport=[];

function setScriptWrappers(result, targetNum) {
    // declare/reset variables
    blocksArray = Object.keys(result.targets[targetNum].blocks);
    argNames=[];
    // set up targetScripts wrapper
    targetScripts=document.createElement('div');
    targetScripts.id='target-scripts-'+targetNum;
    targetScripts.style.display='none';
    // loop through different blocks in a sprite
    for (let i=0;i<blocksArray.length;i++) {
        // if the noticed block is of the correct id
        if (result.targets[targetNum].blocks[blocksArray[i]].opcode=='procedures_prototype') {
            blockWrapper=document.createElement('div');
            hatBlock=document.createElement('label');
            checkbox=document.createElement('input');
            // set attr for checkbox
            checkbox.id=result.targets[targetNum].blocks[blocksArray[i]].parent;
            checkbox.name=result.targets[targetNum].blocks[blocksArray[i]].parent;
            checkbox.type='checkbox';
            hatBlock.setAttribute('for', checkbox.name);
            // set hatBlockText to a string for editing
            hatBlockText=result.targets[targetNum].blocks[blocksArray[i]].mutation.proccode;
            timesReplaced=0;
            // different arguments in a custom block
            argNames=result.targets[targetNum].blocks[blocksArray[i]].mutation.argumentnames.split(',');
            hatBlockTextNew='define ';
            // loop through and start changing the text
            for (let x=0;x<hatBlockText.length;x++) {
                // if the noticed char is a %
                if (hatBlockText.charAt(x)=='%') {
                    // if it is %s
                    if (hatBlockText.charAt(x+1)=='s'||hatBlockText.charAt(x+1)=='n') {
                        // replace and setup for scratchblocks
                        hatBlockTextNew += '['+argNames[timesReplaced].replace(/"|\[|\]/g, '')+']';
                        timesReplaced++;
                        x++;
                    // if it is %b
                    } else {
                        // replace and setup for scratchblocks
                        hatBlockTextNew += '<'+argNames[timesReplaced].replace(/"|\[|\]/g, '')+'>';
                        timesReplaced++;
                        x++;
                    }
                } else {
                    // append the last noticed character
                    hatBlockTextNew += hatBlockText.charAt(x);
                }
            }
            hatBlock.innerText=hatBlockTextNew;
            blockWrapper.appendChild(checkbox);
            blockWrapper.appendChild(hatBlock);
            targetScripts.appendChild(blockWrapper);
            // add an event listener to each checkbox
            let myTitle=hatBlock.innerText;
            checkbox.addEventListener('change', function() {
                // if it's checked, add it's block to an array to be imported, otherwise, remove it from the array
                if (this.checked) {
                    toImport.push({'id':this.id,'title':myTitle});
                } else {
                    toImport.pop(toImport.indexOf({'id':this.id,'title':myTitle}));
                }
                console.log(toImport);
            });
        }
    }
    if (targetScripts.children.length>0) {
        // append the target script only if it has content
        scriptsDiv.appendChild(targetScripts);
    } else {
        // otherwise disable the target button
        document.getElementById('target-'+targetNum).disabled = true;
    }
    // add event listeners to the target buttons in turn that check if they are active
    // this is to decide whether to display the scripts or not
    document.getElementsByClassName('target-button')[targetNum].addEventListener('click', function() {
        // set all script wrapper displays to none regardless of activity
        for (let i=0;i<targetDiv.children.length;i++) {
            if (document.getElementById('target-scripts-'+i)) {
                document.getElementById('target-scripts-'+i).style.display='none';
            }
        }
        // set the single active script wrapper to show
        if (document.getElementById('target-scripts-'+selected)) {
            document.getElementById('target-scripts-'+selected).style.display='flex';
        }
    });
}

// initial screen refresh
screenChange(screen);