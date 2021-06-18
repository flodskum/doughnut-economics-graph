/*
MIT License

Copyright (c) 2021 Jeremy Johnson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

class _DoughnutDimensions {
    constructor(type, maxVal) {
        this.type = type;
        this.maxVal = maxVal;
        // Array of dimension objects, which contain array of levels:
        //  {name: "", levels: [{value: N, label: ""}, ...]}
        this.dimensions = [];
    }
    add(name, value, label) {
        if (name == "") {
            alert("Please enter a dimension name")
        } else {
            let val = parseInt(value);
            if (val > 100) { val = this.maxVal; }
            if (val < -100) { val = -100; }
            let level = { value: val, label: label };
            let index = this.find(name);
            if (index >= 0) {
                this.dimensions[index].levels.push(level);
            } else {
                this.dimensions.push({ name: name, levels: [level] });
            }
        }
    }
    get(index) {
        return this.dimensions[index];
    }
    deleteLast() {
        if (this.dimensions.length > 0) {
            this.dimensions.pop();
        }
    }
    length() {
        return this.dimensions.length;
    }
    clear() {
        this.dimensions = [];
    }
    string() {
        let string = "";
        for (let dimNo = 0; dimNo < this.dimensions.length; dimNo++) {
            let dim = this.dimensions[dimNo];
            if (dimNo > 0) { string += " / " }
            string += dim.name + ":";
            for (let lvlNo = 0; lvlNo < dim.levels.length; lvlNo++) {
                let level = dim.levels[lvlNo];
                if (lvlNo > 0) { string += "," }
                if (level.label != "") { string += level.label + "=" }
                string += level.value;
            }
        }
        return string;
    }
    // Outputs as rows:
    // DimensionType, DimensionName, LevelValue, LevelLabel
    export() {
        let csv = [];
        for (let dimNo = 0; dimNo < this.dimensions.length; dimNo++) {
            let dim = this.dimensions[dimNo];
            for (let level of dim.levels) {
                let row = this.type + "," + dim.name + ",";
                row += level.value + "," + level.label;
                csv.push(row);
            }
        }
        return csv.join("\n");
    }
    find(name) {
        let num = 0;
        for (let dim of this.dimensions) {
            if (dim.name == name) {
                return num;
            }
            num++;
        }
        return -1;
    }
    // Inputs rows:
    // DimensionType, DimensionName, LevelValue, LevelLabel
    import(text) {
        let errors = 0;
        let csv = text.split("\n");
        for (let row of csv) {
            let cols = row.split(",");
            if (cols.length == 4) {
                if (cols[0] == this.type) {
                    this.add(cols[1], cols[2], cols[3]);
                }
            } else {
                errors++;
            }
        }
        return errors;
    }
}
    
class Doughnut {
    // size: Size of doughnut
    // canvasId: Id of canvas element to draw the doughnut into
    // divId: Id of div element that canvas is in (to allow resize correctly)
    // infoId: Optional id of doughnut dimension info
    // innerId: Optional id of paragraph to show inner dimensions list
    // outerId: Optional id of paragraph to show outer dimensions list
    // exportId: Optional id of textarea to show export CSV string
    constructor(size, canvasId, divId, infoId, innerId, outerId, exportId) {
        this._donutSize = size;
        this._canvasId = canvasId;
        this._divId = divId;
        this._infoId = infoId;
        this._innerId = innerId;
        this._outerId = outerId;
        this._exportId = exportId;

        // Size of doughnut dimensions
        this._middleX = this._donutSize / 2;
        this._middleY = this._donutSize / 2;
        this._donutLineSize = 16;   // For the outer/inner safe zone lines
        this._donutMargin = 100;    // The space around the whole doughnut diagram
        this._section = (this._donutSize - this._donutMargin) / 8;
        this._inInner = this._section;
        this._outInner = this._inInner + this._section; // this._section * 2
        this._inDonut = this._outInner;
        this._outDonut = this._inDonut + this._section; // this._section * 3
        this._midDonut = this._inDonut + (this._outDonut - this._inDonut) / 2;
        this._inOuter = this._outDonut;
        this._outOuter = this._inOuter + this._section; // this._section * 4
        this._extraDonut = this._outOuter + 25;   // For the complete overshoot
        this._textSize = 14;
        this._arcLineWidth = 2;
        this._textInner = this._outInner + (this._section / 2);
        this._textOuter = this._outOuter - this._textSize;
        this._maxDonutRadius = 150;
        this._donutFrosting = "rgb(71,112,32)";
        this._donutFilling = "rgb(140,215,85)";

        let canvas = document.getElementById(canvasId);
        this._ctx = canvas.getContext("2d");
        // Set size of canvas & div to the required doughnut size
        canvas.style.width = this._donutSize;
        canvas.style.height = this._donutSize;
        canvas.width = this._donutSize;
        canvas.height = this._donutSize;
        let div = document.getElementById(divId);
        div.style.maxWidth = this._donutSize;
    
        this._grdGlobal = this._ctx.createRadialGradient(this._middleX, this._middleY, this._outOuter, this._middleX, this._middleY, this._extraDonut);
        this._grdGlobal.addColorStop(0, "rgb(211,63,54)");
        this._grdGlobal.addColorStop(1, "white");
    
        this._grdPersonal = this._ctx.createRadialGradient(this._middleX, this._middleY, this._inInner, this._middleX, this._middleY, this._outOuter);
        this._grdPersonal.addColorStop(0, "rgb(136,50,81)");
        this._grdPersonal.addColorStop(1, "rgb(224,150,198)");
    
        this._grd = this._grdPersonal;
        this._innerDims = new _DoughnutDimensions("inner", 100);
        this._outerDims = new _DoughnutDimensions("outer", this._maxDonutRadius);
        this._innerPaths = null;
        this._outerPaths = null;

        canvas.addEventListener("mousemove", (e) => {
            let caption = this._checkMouseOver(e.offsetX, e.offsetY);
            if (caption) {
                if (this._infoId) {
                    document.getElementById(this._infoId).innerHTML = "Dimension Info: " + caption;
                }
                canvas.style.cursor = "crosshair";
            } else {
                if (this._infoId) {
                    document.getElementById(this._infoId).innerHTML = "Dimension Info: None";
                }
                canvas.style.cursor = "default";
            }
         });

        // Call first draw
        this.update();
    }

    _checkMousePathsDims(dims, paths, x, y) {
        let caption = "";
        let found = false;
        //this._debug(x + "," + y);
        let dim = 0, lvl = 0;
        for (dim = 0; dim < dims.length(); dim++) {
            let subpaths = paths[dim];
            for (lvl = 0; lvl < subpaths.length; lvl++) {
                if (this._ctx.isPointInPath(subpaths[lvl], x, y)) {
                    //this._debug("found");
                    found = true;
                    break;
                }
            }
            if (found) { break; }
        }
        if (found) {
            let info = dims.get(dim);
            caption = info.name;
            if (info.levels[lvl].label) { caption += "/" + info.levels[lvl].label }
            caption += " = " + info.levels[lvl].value;
            //this._debug("Mouse over: " + caption );
        }
        return caption;
    }

    _checkMouseOver(x, y) {
        let caption = "";
        if (this._innerPaths != null) {
            caption = this._checkMousePathsDims(this._innerDims, this._innerPaths, x, y);
        }
        if (!caption && this._outerPaths != null) {
            caption = this._checkMousePathsDims(this._outerDims, this._outerPaths, x, y);
        }
        return caption;
    }

    addOuter(name, level, label) {
        this._outerDims.add(name, level, label);
        this.update();
    }
    addInner(name, level, label) {
        this._innerDims.add(name, level, label);
        this.update();
    }
    delOuter() {
        this._outerDims.deleteLast();
        this.update();
    }
    delInner() {
        this._innerDims.deleteLast();
        this.update();
    }

    clearDoughnut() {
        this._innerDims.clear();
        this._outerDims.clear();
        this.update();
    }

    // Import via CSV format:
    // Headings: "DimensionType", "DimensionName", "DimensionValue", "SubDimensionLabel"
    // Example:  Inner, income, 76, "male income"
    //           Inner, income, 81, "female income"
    //           Outer, "climate change", 150, ""
    import(text) {
        const failure = "Format errors\nExpects rows with 4 cols: type, name, value, sub-label\n   outer, climate change, 76,\n   inner, food, 20, imports\n   inner, food, 56, exports";
        let errors = this._innerDims.import(text);
        errors += this._outerDims.import(text);
        if (errors) {
            alert(failure);
        }
        this.update();
    }

    setColours(number) {
        switch (number) {
            case 1:
                this._grd = this._grdPersonal;
                break;
            case 2:
                this._grd = this._grdGlobal;
                break;
        }
        this.update();
    }

    _isNotNumber(number) {
        return (Number.isNaN(number) || typeof number != 'number')
    }

    _drawDoughnut() {
        let adjust = this._donutLineSize / 2;
        this._ctx.lineWidth = this._donutLineSize;
        this._ctx.strokeStyle = this._donutFrosting;
        // Inside line
        this._ctx.beginPath();
        this._ctx.arc(this._middleX, this._middleY, this._inDonut + adjust, 0, 2 * Math.PI);
        this._ctx.stroke();
        // Outside line
        this._ctx.beginPath();
        this._ctx.arc(this._middleX, this._middleY, this._outDonut - adjust, 0, 2 * Math.PI);
        this._ctx.stroke();
        // Fill in between the lines
        this._ctx.strokeStyle = this._donutFilling;
        this._ctx.beginPath();
        this._ctx.lineWidth = this._outDonut - this._inDonut - this._donutLineSize * 2;
        let middle = (this._outDonut - this._inDonut) / 2;
        this._ctx.arc(this._middleX, this._middleY, this._inDonut + middle, 0, 2 * Math.PI);
        this._ctx.stroke();
        this._ctx.lineWidth = 1;
    }

    _splitText(text) {
        let words = text.split(" ");
        if (words.length <= 2) {
            // Only 1 or 2 words
            return words;
        }
        let half = text.length / 2;
        let result = [];
        let part = words[0];
        for (let word = 1; word < words.length; word++) {
            // Over half of length already or only one word left and no split yet - create split
            if (part.length >= half ||
                (result.length == 0 && words.length - word == 1)) {
                result.push(part);
                part = words[word];
            } else {
                part = part + " " + words[word];
            }
        }
        result.push(part);
        return result;
    }
    _writeDim(text, radius, angle, colour) {
        let x = this._middleX + radius * Math.cos(angle);
        let y = this._middleY + radius * Math.sin(angle);
        this._ctx.fillStyle = colour;
        this._ctx.shadowColor = "black";
        if (colour == "black") {
            this._ctx.shadowColor = "white";
        }
        this._ctx.shadowOffsetX = 1;
        this._ctx.shadowOffsetY = 1;
        let textParts = this._splitText(text);
        for (let part of textParts) {
            this._ctx.fillText(part, x, y);
            y = y + this._textSize;
        }
        this._ctx.shadowOffsetX = 0;
        this._ctx.shadowOffsetY = 0;
    }

    _writeDimensions(dimensions, radius, colour) {
        let arcDegrees = (2 * Math.PI) / dimensions.length();
        let arcStart = 0;
        for (let arc = 0; arc < dimensions.length(); arc++) {
            let arcEnd = arcStart + arcDegrees;
            this._writeDim(dimensions.get(arc).name, radius, arcStart + (arcDegrees / 2), colour);
            arcStart = arcEnd;
        }
    }

    // Draw the supplied arcs - the structure of the next 3 args MUST match
    // radiiOut: Outer radius lengths - either array of arrays for each sub-arc in an arc, or an array of arcs
    // radiiIn: Inner radius lengths - either array of arrays for each sub-arc in an arc, or an array of arcs
    // radiiColour: Coulurs - either array of arrays of colours for each sub-arc in an arc, or an array of cols
    // start: starting arc degress (0 to 2pi)
    // totalDegrees: degrees to fill with the supplied arcs
    _drawArcsRange(radiiOut, radiiIn, radiiColour, start, totalDegrees, max, min) {
        let numArcs = radiiOut.length;
        let arcStart = start;
        let arcDegrees = totalDegrees / numArcs;
        let paths = [];

        for (let arc = 0; arc < numArcs; arc++) {
            let arcEnd = arcStart + arcDegrees;
            if (Array.isArray(radiiOut[arc])) {
                // Sub arcs!
                let subpaths = this._drawArcsRange(radiiOut[arc], radiiIn[arc], radiiColour[arc], arcStart, arcDegrees, max, min);
                paths[arc] = subpaths;
            } else {
                // Draw the arc
                //this._debug("arc-deg:" + arc + "," + arcStart + "," + arcEnd);
                //this._debug("arc-rad:" + arc + "," + radiiOut[arc].toString() + "," + radiiIn[arc].toString() + "," + radiiColour[arc]);
                this._ctx.fillStyle = radiiColour[arc];
                this._ctx.beginPath();
                this._ctx.arc(this._middleX, this._middleY, radiiOut[arc], arcStart, arcEnd);
                this._ctx.arc(this._middleX, this._middleY, radiiIn[arc], arcEnd, arcStart, true);
                this._ctx.closePath();
                this._ctx.stroke();
                this._ctx.fill();
                // Create a path to find this arc
                //this._debug("arc-path:" + arc + "," + max + "," + min);
                let p = new Path2D;
                p.lineWidth = 10;
                p.arc(this._middleX, this._middleY, max, arcStart, arcEnd);
                p.arc(this._middleX, this._middleY, min, arcEnd, arcStart, true);
                p.closePath();
                paths[arc] = p;
            }
            arcStart = arcEnd;
        }
        return paths;
    }

    _drawArcs(radiiOut, radiiIn, radiiColour, strokeColour, max, min) {
        this._ctx.lineWidth = this._arcLineWidth;
        this._ctx.strokeStyle = strokeColour;
        let paths = this._drawArcsRange(radiiOut, radiiIn, radiiColour, 0, (2 * Math.PI), max, min);
        this._ctx.lineWidth = 1;
        return paths;
    }

    _drawDimensions(dims, extMax, extMin) {
        const INNER = 0;
        const OUTER = 1;
        let paths = null;
        if (dims.length() > 0) {
            let inRadii = [];
            let outRadii = [];
            let colRadii = [];
            let extScale = (extMax - extMin) / 100;
            let intScale = ((this._outDonut - this._inDonut) / 2) / 100;
            let type = null;
            let min = 0, max =0;
            if (extMax > this._outDonut) { 
                type = OUTER;
                min = this._midDonut;
                max = extMax;
            } else {
                type = INNER;
                min = extMin;
                max = this._midDonut;
            }
            for (let dim = 0; dim < dims.length(); dim++) {
                let levels = dims.get(dim).levels;
                let inArcs = [];
                let outArcs = [];
                let cols = [];
                for (let lvl = 0; lvl < levels.length; lvl++) {
                    let val = levels[lvl].value;
                    let outer = 0;
                    let inner = 0;
                    let col = this._grd;
                    if (this._isNotNumber(val)) {
                        val = 100;
                        col = "lightgray";
                    }
                    if (type == INNER) {
                        if (val < 0) { 
                            // Negative value
                            inner = extMax;
                            // Double negative is positive!
                            outer = extMax - (val * intScale);
                            col = "white"
                        } else {
                            inner = extMin + ((100 - val) * extScale);
                            outer = extMax;
                        }
                    } else {
                        if (val < 0) { 
                            // Negative value
                            inner = extMin + (val * intScale);
                            outer = extMin;
                            col = "white"
                        } else {
                            inner = extMin;
                            outer = extMin + (val * extScale);
                        }
                    }
                    inArcs.push(inner);
                    outArcs.push(outer);
                    cols.push(col);
                }
                inRadii[dim] = inArcs;
                outRadii[dim] = outArcs;
                colRadii[dim] = cols;
            }
            //this._debug(inRadii.toString());
            //this._debug(outRadii.toString());
            //this._debug(colRadii.toString());
            paths = this._drawArcs(outRadii, inRadii, colRadii, "white", max, min);
        }
        return paths;
    }

    _drawLabels() {
        if (this._innerDims.length() > 0) {
            this._writeDimensions(this._innerDims, this._textInner, "white") }
        if (this._outerDims.length() > 0) {
            this._writeDimensions(this._outerDims, this._textOuter, "black");
        }
    }

    _drawInnerDimensions() {
        this._innerPaths = this._drawDimensions(this._innerDims, this._outInner, this._inInner);
    }

    _drawOuterDimensions() {
        this._outerPaths = this._drawDimensions(this._outerDims, this._outOuter, this._inOuter);
    }

    _drawLimits() {
        let dash = this._ctx.getLineDash();
        this._ctx.setLineDash([5]);
        this._ctx.strokeStyle = "gray";
        this._ctx.beginPath();
        this._ctx.arc(this._middleX, this._middleY, this._outOuter, 0, 2 * Math.PI);
        this._ctx.stroke();
        this._ctx.beginPath();
        this._ctx.arc(this._middleX, this._middleY, this._midDonut, 0, 2 * Math.PI);
        this._ctx.stroke();
        this._ctx.beginPath();
        this._ctx.arc(this._middleX, this._middleY, this._inInner, 0, 2 * Math.PI);
        this._ctx.stroke();
        this._ctx.setLineDash(dash);
        this._ctx.strokeStyle = this._donutFrosting;
        this._ctx.beginPath();
        this._ctx.arc(this._middleX, this._middleY, this._outDonut, 0, 2 * Math.PI);
        this._ctx.stroke();
        this._ctx.beginPath();
        // With fudge factor...
        this._ctx.arc(this._middleX, this._middleY, this._inDonut + 1, 0, 2 * Math.PI);
        this._ctx.stroke();
    }

    _setupCanvas() {
        this._ctx.font = this._textSize + "px Arial";
        this._ctx.textAlign = "center";
        this._ctx.lineWidth = 1;
        this._ctx.strokeStyle = "black";
        this._ctx.shadowBlur = 0;
        this._ctx.shadowOffsetX = 0;
        this._ctx.shadowOffsetY = 0;
        this._ctx.shadowColor = "black";

        // Clear canvas
        this._ctx.beginPath();
        this._ctx.rect(0, 0, this._donutSize, this._donutSize);
        this._ctx.closePath();
        this._ctx.fillStyle = "white";
        this._ctx.fill();
    }

    export() {
        let exportText = this._innerDims.export();
        if (exportText.length > 0) { exportText += "\n"; }
        exportText += this._outerDims.export();
        return exportText;
    }

    _debug(text) {
        let debug = document.getElementById("debug");
        let current = debug.innerHTML;
        debug.innerHTML = current + "<br>\n" + text;
    }

    update() {
        if (this._innerId) {
            document.getElementById(this._innerId).innerHTML = "Inner: " + this._innerDims.string();
        }
        if (this._outerId) {
            document.getElementById(this._outerId).innerHTML = "Outer: " + this._outerDims.string();
        }
        if (this._exportId) { 
            document.getElementById(this._exportId).value = this.export();
        }

        this._setupCanvas();
        this._drawDoughnut();
        this._drawOuterDimensions();
        this._drawInnerDimensions();
        this._drawLimits();
        this._drawLabels();
        this._ctx.fillStyle = "black";
        this._ctx.fillText("Doughnut", this._middleX, this._middleY - this._textSize);
        this._ctx.fillText("Economics", this._middleX, this._middleY + this._textSize)
    }
}