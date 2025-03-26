
//https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
var ws = new WebSocket("ws://localhost:8080");


async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

let masterSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
masterSvg.setAttribute("x", "0");
masterSvg.setAttribute("y", "0");
masterSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg")

masterSvg.setAttribute("width", "1500");
masterSvg.setAttribute("height", "1500");
document.body.appendChild(masterSvg);

function snapshot() {
    ws.send(masterSvg.outerHTML);
    /*
    //move all the elements of body to a master svg
    for(let n = 0; n < document.body.children.length; n++){
        masterSvg.appendChild(document.body.children[n]);
    }

    //send the master to the server
    ws.send(masterSvg.outerHTML);

    //move all the elements of the master back to the body
    for(let n = 0; n < masterSvg.children.length; n++){
        document.body.appendChild(masterSvg.children[n]);
    }
    */
}

function buildAnimation(svg, specSteps, genSteps, setting, nodeNames, omitPolygon) {


    let circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circ.setAttribute("cx", "250");
    circ.setAttribute("cy", "250");
    circ.setAttribute("r", "200");
    circ.setAttribute("stroke", "blue");
    circ.setAttribute("stroke-width", "5");
    circ.setAttribute("fill", "none");

    svg.appendChild(circ);
    class VisualNode {
        constructor(theta, filled, name) {
            this.theta = theta - Math.PI / 2.0;
            this.dgRotation = 0;
            this.x = 200 * Math.cos(this.theta) + 250;
            this.y = 200 * Math.sin(this.theta) + 250;
            this.filled = filled;
            this.svg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.name = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.name.textContent = name;
            this.name.setAttribute("dominant-baseline", "central");
            this.name.setAttribute("text-anchor", "middle");
            this.name.setAttribute("x", 225 * Math.cos(this.theta) + 250);
            this.name.setAttribute("y", 225 * Math.sin(this.theta) + 250);

            this.updateSVG();
        }

        updateSVG() {
            this.x = 200 * Math.cos(this.theta + this.dgRotation) + 250;
            this.y = 200 * Math.sin(this.theta + this.dgRotation) + 250;
            this.svg.setAttribute("cx", this.x.toString());
            this.svg.setAttribute("cy", this.y.toString());
            this.svg.setAttribute("r", "10");
            this.svg.setAttribute("stroke", "blue");
            this.svg.setAttribute("stroke-width", "5");
            if (this.filled) {
                this.svg.setAttribute("fill", "blue");
            }
            else {
                this.svg.setAttribute("fill", "white");
            }
            this.name.setAttribute("x", 225 * Math.cos(this.theta + this.dgRotation) + 250);
            this.name.setAttribute("y", 225 * Math.sin(this.theta + + this.dgRotation) + 250);
        }
    }

    function createNodes(svg, numOfNodes) {
        let nodes = [];
        for (let n = 0; n < numOfNodes; n++) {
            let theta = 2 * Math.PI * n / numOfNodes;
            let vn = new VisualNode(theta, false, nodeNames[n]);
            svg.appendChild(vn.svg);
            svg.appendChild(vn.name);
            nodes.push(vn);
        }
        return nodes;
    }

    class VisualOnset {
        constructor(curRadians, destRadians, initRadians) {
            this.dgRotation = 0;
            this.curRadians = curRadians;
            this.destRadians = destRadians;
            this.initRadians = initRadians;

            this.x = Math.cos(this.curRadians - Math.PI / 2.0) * 200 + 250;
            this.y = Math.sin(this.curRadians - Math.PI / 2.0) * 200 + 250;
            this.line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            this.line.setAttribute("stroke", "green");
            this.line.setAttribute("stroke-width", "5");
            this.circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.circle.setAttribute("cx", this.x.toString());
            this.circle.setAttribute("cy", this.y.toString());
            this.circle.setAttribute("r", "10");
            this.circle.setAttribute("fill", "green");

        }

        updateSVG(destination) {
            this.x = Math.cos(this.dgRotation + this.curRadians - Math.PI / 2.0) * 200 + 250;
            this.y = Math.sin(this.dgRotation + this.curRadians - Math.PI / 2.0) * 200 + 250;
            this.line.setAttribute("x1", this.x.toString());
            this.line.setAttribute("y1", this.y.toString());
            this.line.setAttribute("x2", destination.x.toString());
            this.line.setAttribute("y2", destination.y.toString());
            this.circle.setAttribute("cx", this.x.toString());
            this.circle.setAttribute("cy", this.y.toString());
        }

        setRadFromFrame(frame, totFrames) {
            let percComp = frame / Number(totFrames);
            if (percComp >= 1) {
                //console.log(percComp);
                this.circle.setAttribute("fill", "none");
            }
            this.curRadians = this.initRadians + percComp * (this.destRadians - this.initRadians);
        }
    }

    function createOnsets(svg, onsets, nodes, setting) {
        let onsetArr = [];
        //onsets = Number(onsets);
        for (let i = 0; i < onsets; i++) {
            let rad = Math.PI * 2 * i / Number(onsets);

            let dest = Math.PI * 2 * Math.round(nodes * (i / Number(onsets))) / Number(nodes);
            switch (setting) {
                case 1:
                    dest = dest = Math.PI * 2 * Math.floor(nodes * (i / Number(onsets))) / Number(nodes);
                    break;
                case 2:
                    dest = dest = Math.PI * 2 * (1 + Math.floor(nodes * (i / Number(onsets)))) / Number(nodes);
                    break;
            }
            let os = new VisualOnset(rad, dest, rad);
            if (!omitPolygon) {
                svg.appendChild(os.line);
                svg.appendChild(os.circle);
            }
            onsetArr.push(os);
        }
        for (let i = 0; i < onsets; i++) {
            onsetArr[i].updateSVG(onsetArr[(i + 1) % onsets]);
        }
        return onsetArr;
    }

    let onsetArr = createOnsets(svg, genSteps, specSteps, setting);
    let nodes = createNodes(svg, specSteps);

    function addPolygon() {
        onsetArr.forEach((os) => {
            svg.appendChild(os.line);
            svg.appendChild(os.circle);
        });
        //still put nodes on top
        nodes.forEach((visualNode) => {
            svg.appendChild(visualNode.svg);
            svg.appendChild(visualNode.name);
        });
    }

    class Diagram {
        constructor(onsetArr, nodes, svg) {
            this.onsetArr = onsetArr;
            this.nodes = nodes;
            this.svg = svg;
        }
    }

    let labelText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    labelText.textContent = "Snap to the Closest";
    switch (setting) {
        case 1:
            labelText.textContent = "Snap to the Left";
            break;
        case 2:
            labelText.textContent = "Snap to the Right";
            break;
    }
    labelText.setAttribute("dominant-baseline", "central");
    labelText.setAttribute("text-anchor", "middle");
    labelText.setAttribute("x", 250 + Number(svg.getAttribute("x")));
    labelText.setAttribute("y", 530);
    labelText.setAttribute("font-size", "2em");

    let frame = 0;
    let totFrames = 1.5 * 1000 / 50;

    async function animate() {

        masterSvg.appendChild(labelText);

        while (frame - 1 < totFrames) {
            for (let i = 0; i < onsetArr.length; i++) {
                onsetArr[i].setRadFromFrame(frame, totFrames);
            }
            for (let i = 0; i < onsetArr.length; i++) {
                onsetArr[i].updateSVG(onsetArr[(i + 1) % onsetArr.length]);
            }
            frame++;
            //snapshot();
            await sleep(50);
        }
        onsetArr.forEach((onset) => {
            nodes.forEach((node) => {
                if (node.x === onset.x && node.y === onset.y) {
                    node.filled = true;
                    node.updateSVG();
                }
            });
        });


        //console.log(masterSvg.outerHTML);
        //snapshot();
        svg.onclick = animate1;
        //document.body.onclick = animates.shift();
    }

    svg.onclick = animate;

    return { onsetArr, nodes, svg, animate, addPolygon, labelText };
}

/*
let scaleableFrame = document.createElementNS("http://www.w3.org/2000/svg", "svg");
document.body.appendChild(scaleableFrame);
scaleableFrame.setAttribute("x", "0");
scaleableFrame.setAttribute("y", "0");
scaleableFrame.setAttribute("width", "1500");
scaleableFrame.setAttribute("height", "1500");
scaleableFrame.setAttribute("transform", "scale(0.5)");
*/

diagrams = []
let animates = []

let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("x", "510");
svg.setAttribute("y", "10");

svg.setAttribute("width", "500");
svg.setAttribute("height", "500");

let dgObj = buildAnimation(svg, 12, 5, 0, ["C", "C\u266F", "D", "E\u266D", "E", "F", "F\u266F", "G", "A\u266D", "A", "B\u266D", "B"], true);
masterSvg.appendChild(svg);
animates.push(dgObj.addPolygon);
animates.push(dgObj.animate);
animates.push(animate1);
diagrams.push(dgObj);
animates.push(addOthers);

function addOthers() {
    for (let setting = 1; setting < 3; setting++) {
        let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("x", (10 + setting * 500).toString());
        svg.setAttribute("y", "10");

        svg.setAttribute("width", "500");
        svg.setAttribute("height", "500");

        //masterSvg.appendChild(svg);


        let dgObj = buildAnimation(svg, 12, 5, setting, ["C", "C\u266F", "D", "E\u266D", "E", "F", "F\u266F", "G", "A\u266D", "A", "B\u266D", "B"]);
        animates.push(dgObj.animate);
        //masterSvg.appendChild(dgObj.svg);
        if (setting > 0)
            diagrams.push(dgObj);
        //document.body.appendChild(svg);
        masterSvg.appendChild(svg);
    }
    for (let n = 0; n < 2; n++)
        animates.push(animate1);
}

function executeAnimation() {
    animates.shift()();
}
document.body.onclick = executeAnimation;

let dests = [[0, -500], [-2 * Math.PI * 2 / 12.0, -500], [-2 * Math.PI * 3 / 12.0, -1000]]
function animate1() {
    let d = dests.shift();
    rotate(diagrams.shift(), d[0], d[1]);
}

//let dest = -2 * Math.PI * 2 / 12.0;
async function rotate(dg, dest, destX) {
    let f = 0;
    let theta = 0;
    let x = 0;
    let totFrames = (1.5 * 1000 / 50) * Math.abs(destX) / 500;
    let initX = Number(dg.svg.getAttribute("x"));
    if (dest != 0) {
        dg.nodes.forEach((visualNode) => {
            visualNode.name.parentNode.removeChild(visualNode.name);
        });
        dg.labelText.parentNode.removeChild(dg.labelText);
    }

    while (f - 1 < totFrames) {


        dg.svg.setAttribute("transform", "translate(" + x + " 0)");
        dg.svg.setAttribute("x", (initX + x) + "");

        dg.labelText.setAttribute("x", 250 + Number(dg.svg.getAttribute("x")));

        dg.onsetArr.forEach((onset) => { onset.dgRotation = theta });
        dg.nodes.forEach((node) => {
            node.dgRotation = theta;
            node.updateSVG();
        });
        for (let i = 0; i < dg.onsetArr.length; i++) {
            dg.onsetArr[i].updateSVG(dg.onsetArr[(i + 1) % dg.onsetArr.length]);
        }

        theta += dest / Number(totFrames);
        x += destX / Number(totFrames);
        f++;
        await sleep(50);
    }
}
/*
    .attr("x", 10)
    .attr("y", 10)
    .attr("width", 80)
    .attr("height", 80)
    .style("fill", "orange");
    */