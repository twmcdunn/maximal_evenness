
//https://developer.mozilla.org/en-US/docs/Web/API/Element/animate



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
            this.theta = theta;
            this.x = 200 * Math.cos(this.theta) + 250;
            this.y = 200 * Math.sin(this.theta) + 250;
            this.filled = filled;
            this.svg = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            this.name = document.createElementNS("http://www.w3.org/2000/svg", "text");
            this.name.textContent = name;
            //this.

            this.updateSVG();
        }

        updateSVG() {
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
        }
    }

    function createNodes(svg, numOfNodes) {
        let nodes = [];
        for (let n = 0; n < numOfNodes; n++) {
            let theta = 2 * Math.PI * n / numOfNodes;
            let vn = new VisualNode(theta, false);
            svg.appendChild(vn.svg);
            nodes.push(vn);
        }
        return nodes;
    }

    class VisualOnset {
        constructor(curRadians, destRadians, initRadians) {
            this.curRadians = curRadians;
            this.destRadians = destRadians;
            this.initRadians = initRadians;

            this.x = Math.cos(this.curRadians) * 200 + 250;
            this.y = Math.sin(this.curRadians) * 200 + 250;
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
            this.x = Math.cos(this.curRadians) * 200 + 250;
            this.y = Math.sin(this.curRadians) * 200 + 250;
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

    let frame = 0;
    let totFrames = 1.5 * 1000 / 50;

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
        onsetArr.forEach((onset) => {
            nodes.forEach((node) => {
                if (node.x === onset.x && node.y === onset.y) {
                    node.filled = true;
                    node.updateSVG();
                }
            });
        });
    }

    svg.onclick = animate;
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

for (let setting = 0; setting < 3; setting++) {
    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("x", (10 + setting * 500).toString());
    svg.setAttribute("y", "10");

    svg.setAttribute("width", "500");
    svg.setAttribute("height", "500");



    buildAnimation(svg, 12, 8, setting);
    document.body.appendChild(svg);
}
/*
    .attr("x", 10)
    .attr("y", 10)
    .attr("width", 80)
    .attr("height", 80)
    .style("fill", "orange");
    */