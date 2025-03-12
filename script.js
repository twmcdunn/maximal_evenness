
//https://developer.mozilla.org/en-US/docs/Web/API/Element/animate

async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

function buildAnimation(svg, specSteps, genSteps, setting, nodeNames) {


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
            svg.appendChild(os.line);
            svg.appendChild(os.circle);
            onsetArr.push(os);
        }
        for (let i = 0; i < onsets; i++) {
            onsetArr[i].updateSVG(onsetArr[(i + 1) % onsets]);
        }
        return onsetArr;
    }



    let onsetArr = createOnsets(svg, genSteps, specSteps, setting);
    let nodes = createNodes(svg, specSteps);

    class Diagram {
        constructor(onsetArr, nodes, svg) {
            this.onsetArr = onsetArr;
            this.nodes = nodes;
            this.svg = svg;
        }
    }

    let frame = 0;
    let totFrames = 1.5 * 1000 / 50;

    async function animate() {
        while (frame - 1 < totFrames) {
            for (let i = 0; i < onsetArr.length; i++) {
                onsetArr[i].setRadFromFrame(frame, totFrames);
            }
            for (let i = 0; i < onsetArr.length; i++) {
                onsetArr[i].updateSVG(onsetArr[(i + 1) % onsetArr.length]);
            }
            frame++;
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
        svg.onclick = animate1;
    }

    svg.onclick = animate;

    return { onsetArr, nodes, svg };
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
for (let setting = 0; setting < 3; setting++) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("x", (10 + setting * 500).toString());
    svg.setAttribute("y", "10");

    svg.setAttribute("width", "500");
    svg.setAttribute("height", "500");


    let dgObj = buildAnimation(svg, 12, 5, setting, ["C", "C\u266F", "D", "E\u266D", "E", "F", "F\u266F", "G", "A\u266D", "A", "B\u266D", "B"]);

    if (setting > 0)
        diagrams.push(dgObj);
    document.body.appendChild(svg);
}

let dests = [[-2 * Math.PI * 2 / 12.0, -500], [-2 * Math.PI * 3 / 12.0, -1000]]
function animate1() {
    let d = dests.shift();
    rotate(diagrams.shift(), d[0], d[1]);
}

//let dest = -2 * Math.PI * 2 / 12.0;
async function rotate(dg, dest, destX) {
    let f = 0;
    let theta = 0;
    let x = 0;
    let totFrames = 1.5 * 1000 / 50;

    while (f - 1 < totFrames) {


        dg.svg.setAttribute("transform", "translate(" + x + " 0)");
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