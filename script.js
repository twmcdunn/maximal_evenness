
//https://developer.mozilla.org/en-US/docs/Web/API/Element/animate
let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
svg.setAttribute("x", "10");
svg.setAttribute("y", "10");

svg.setAttribute("width", "500");
svg.setAttribute("height", "500");

//let svg = body.append('svg').attr('width', 100).attr('height', 100).attr('xmlns', 'http://www.w3.org/2000/svg');
//svg.append("rect");

let circ = document.createElementNS("http://www.w3.org/2000/svg", "circle");
circ.setAttribute("cx", "250");
circ.setAttribute("cy", "250");
circ.setAttribute("r", "200");
circ.setAttribute("stroke", "black");
circ.setAttribute("stroke-width", "1");
circ.setAttribute("fill", "none");

svg.appendChild(circ);

class VisualNode {
    constructor(x, y, filled) {
        this.x = x;
        this.y = y;
        this.filled = filled;
        this.svg = document.createElementNS("http://www.w3.org/2000/svg", "circle");

        this.updateSVG();
    }

    updateSVG() {
        this.svg.setAttribute("cx", this.x.toString());
        this.svg.setAttribute("cy", this.y.toString());
        this.svg.setAttribute("r", "10");
        this.svg.setAttribute("stroke", "black");
        if (this.filled) {
            this.svg.setAttribute("fill", "black");
        }
        else {
            this.svg.setAttribute("fill", "white");
        }
    }
}

function createNodes(svg, numOfNodes) {
    let nodes = [];
    for (let n = 0; n < numOfNodes; n++) {
        let theta = 2 * Math.PI * n / numOfNodes;
        let vn = new VisualNode(200 * Math.cos(theta) + 250, 200 * Math.sin(theta) + 250, false);
        svg.appendChild(vn.svg);
        nodes.push(vn);
    }
    return nodes;
}

let nodes = createNodes(svg, 12);

class VisualOnset {
    constructor(curRadians, destRadians, initRadians) {
        this.curRadians = curRadians;
        this.destRadians = destRadians;
        this.initRadians = initRadians;

        this.x = Math.cos(this.curRadians) * 200 + 250;
        this.y = Math.sin(this.curRadians) * 200 + 250;
        this.line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        this.line.setAttribute("stroke", "black");
    }

    updateSVG(destination) {
        this.x = Math.cos(this.curRadians) * 200 + 250;
        this.y = Math.sin(this.curRadians) * 200 + 250;
        this.line.setAttribute("x1", this.x.toString());
        this.line.setAttribute("y1", this.y.toString());
        this.line.setAttribute("x2", destination.x.toString());
        this.line.setAttribute("y2", destination.y.toString());
    }

    setRadFromFrame(frame, totFrames) {
        let percComp = frame / Number(totFrames);
        if(percComp >= 1)
            console.log(percComp);
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
        onsetArr.push(os);
    }
    for (let i = 0; i < onsets; i++) {
        onsetArr[i].updateSVG(onsetArr[(i + 1) % onsets]);
    }
    return onsetArr;
}

onsetArr = createOnsets(svg, 8, 12, 0);

let frame = 0;
let totFrames = 3 * 1000 / 50;

async function sleep(msec) {
    return new Promise(resolve => setTimeout(resolve, msec));
}

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
}




document.body.appendChild(svg);
animate();
/*
    .attr("x", 10)
    .attr("y", 10)
    .attr("width", 80)
    .attr("height", 80)
    .style("fill", "orange");
    */