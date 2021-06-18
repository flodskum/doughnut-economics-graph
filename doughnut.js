
class Doughnut {
    constructor(size) {

    }
}

    // Size of doughnut and sections!
    const donutSize = 640;
    const middleX = donutSize / 2;
    const middleY = donutSize / 2;
    const donutLineSize = 16;   // For the outer/inner safe zone lines
    const donutMargin = 100;    // The space around the whole doughnut diagram
    const section = (donutSize - donutMargin) / 8;
    const inInner = section;
    const outInner = inInner + section; // section * 2
    const inDonut = outInner;
    const outDonut = inDonut + section; // section * 3
    const inOuter = outDonut;
    const outOuter = inOuter + section; // section * 4
    const extraDonut = outOuter + 25;   // For the complete overshoot
    const textSize = 14;
    const arcLineWidth = 2;
    const textInner = outInner + (section / 2);
    const textOuter = outOuter - textSize;
    const maxDonutRadius = 150;
    const donutFrosting = "rgb(71,112,32)";
    const donutFilling = "rgb(140,215,85)";


    var c = document.getElementById("doughnutCanvas");
    var ctx = c.getContext("2d");
    // Set size of canvas & div to the required doughnut size
    c.style.width = donutSize;
    c.style.height = donutSize;
    c.width = donutSize;
    c.height = donutSize;
    var d = document.getElementById("doughnutDiv");
    d.style.maxWidth = donutSize;

    var grdGlobal = ctx.createRadialGradient(middleX, middleY, outOuter, middleX, middleY, extraDonut);
    grdGlobal.addColorStop(0, "rgb(211,63,54)");
    grdGlobal.addColorStop(1, "white");

    var grdPersonal = ctx.createRadialGradient(middleX, middleY, inInner, middleX, middleY, outOuter);
    grdPersonal.addColorStop(0, "rgb(136,50,81)");
    grdPersonal.addColorStop(1, "rgb(224,150,198)");

    var grd = grdPersonal;

    class DoughnutDimensions {
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
    var innerDims = new DoughnutDimensions("inner", 100);
    var outerDims = new DoughnutDimensions("outer", maxDonutRadius);

    function addOuter(name, level, label) {
        outerDims.add(name, level, label);
        update();
    }
    function addInner(name, level, label) {
        innerDims.add(name, level, label);
        update();
    }
    function delOuter() {
        outerDims.deleteLast();
        update();
    }
    function delInner() {
        innerDims.deleteLast();
        update();
    }

    function _randInt() {
        return Math.round(Math.random() * 100)
    }
    function _randValue() {
        let type = _randInt();
        if (type <= 70) {
            return _randInt();
        } else if (type <= 80) {
            return -(_randInt());
        } else if (type <= 90) {
            return 150;
        } else {
            return "NaN";
        }
    }


    function clearDoughnut() {
        innerDims.clear();
        outerDims.clear();
        update();
    }

    // Import via CSV format:
    // Headings: "DimensionType", "DimensionName", "DimensionValue", "SubDimensionLabel"
    // Example:  Inner, income, 76, "male income"
    //           Inner, income, 81, "female income"
    //           Outer, "climate change", 150, ""
    function importDoughnut(text) {
        const failure = "Format errors\nExpects rows with 4 cols: type, name, value, sub-label\n   outer, climate change, 76,\n   inner, food, 20, imports\n   inner, food, 56, exports";
        let errors = innerDims.import(text);
        errors += outerDims.import(text);
        if (errors) {
            alert(failure);
        }
        update();
    }

    function setColours(number) {
        switch (number) {
            case 1:
                grd = grdPersonal;
                break;
            case 2:
                grd = grdGlobal;
                break;
        }
        update();
    }

    function _isNotNumber(number) {
        return (Number.isNaN(number) || typeof number != 'number')
    }

    function drawDoughnut() {
        let adjust = donutLineSize / 2;
        ctx.lineWidth = donutLineSize;
        ctx.strokeStyle = donutFrosting;
        // Inside line
        ctx.beginPath();
        ctx.arc(middleX, middleY, inDonut + adjust, 0, 2 * Math.PI);
        ctx.stroke();
        // Outside line
        ctx.beginPath();
        ctx.arc(middleX, middleY, outDonut - adjust, 0, 2 * Math.PI);
        ctx.stroke();
        // Fill in between the lines
        ctx.strokeStyle = donutFilling;
        ctx.beginPath();
        ctx.lineWidth = outDonut - inDonut - donutLineSize * 2;
        let middle = (outDonut - inDonut) / 2;
        ctx.arc(middleX, middleY, inDonut + middle, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.lineWidth = 1;
    }

    function _splitText(text) {
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
    function _writeDim(text, radius, angle, colour) {
        let x = middleX + radius * Math.cos(angle);
        let y = middleY + radius * Math.sin(angle);
        ctx.fillStyle = colour;
        ctx.shadowColor = "black";
        if (colour == "black") {
            ctx.shadowColor = "white";
        }
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        let textParts = _splitText(text);
        for (let part of textParts) {
            ctx.fillText(part, x, y);
            y = y + textSize;
        }
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    function _writeDimensions(dimensions, radius, colour) {
        let arcDegrees = (2 * Math.PI) / dimensions.length();
        let arcStart = 0;
        for (let arc = 0; arc < dimensions.length(); arc++) {
            let arcEnd = arcStart + arcDegrees;
            _writeDim(dimensions.get(arc).name, radius, arcStart + (arcDegrees / 2), colour);
            arcStart = arcEnd;
        }
    }

    // Draw the supplied arcs
    // radii: Array of radius lengths for each arch
    // radiiColour: Either array of colours (one per arc), or a single colour, or null
    // start: starting arc degress (0 to 2pi)
    // totalDegrees: degrees to fill with the supplied arcs
    function _drawArcsRange(radii, radiiColour, start, totalDegrees) {
        let numArcs = radii.length;
        let arcStart = start;
        let arcDegrees = totalDegrees / numArcs;

        for (let arc = 0; arc < numArcs; arc++) {
            let arcEnd = arcStart + arcDegrees;
            if (radiiColour != null) {
                if (Array.isArray(radiiColour)) {
                    ctx.fillStyle = radiiColour[arc];
                } else {
                    ctx.fillStyle = radiiColour;
                }
            }
            if (Array.isArray(radii[arc])) {
                // Sub arcs!
                _drawArcsRange(radii[arc], null, arcStart, arcDegrees);
            } else {
                ctx.beginPath();
                ctx.lineTo(middleX, middleY);
                ctx.arc(middleX, middleY, radii[arc], arcStart, arcEnd);
                ctx.closePath();
                ctx.stroke();
                ctx.fill();
            }
            arcStart = arcEnd;
        }
    }

    function _drawArcs(radii, radiiColour, strokeColour) {
        ctx.lineWidth = arcLineWidth;
        ctx.strokeStyle = strokeColour;
        _drawArcsRange(radii, radiiColour, 0, (2 * Math.PI));
        ctx.lineWidth = 1;
    }

    function drawLabels() {
        if (innerDims.length() > 0) {
            _writeDimensions(innerDims, textInner, "white");
        }
        if (outerDims.length() > 0) {
            _writeDimensions(outerDims, textOuter, "black");
        }
    }

    function drawInnerDimensions() {
        if (innerDims.length() > 0) {
            let dimRadii = [];
            let holeRadii = [];
            let scale = (outInner - inInner) / 100;
            for (let dim = 0; dim < innerDims.length(); dim++) {
                // Colour arc all the way to the doughnut
                dimRadii[dim] = outInner;
                // Blank out arc up to the opposite of the level
                let levels = innerDims.get(dim).levels;
                let arcs = [];
                for (let lvl = 0; lvl < levels.length; lvl++) {
                    let val = levels[lvl].value;
                    if (_isNotNumber(val)) {
                        // TODO add proper support for NaNs
                        val = 0;
                    }
                    // Doughnut section only has half available for inner dimensions
                    if (val < 0) { val /= 2; }
                    arcs.push(inInner + ((100 - val) * scale));
                }
                holeRadii[dim] = arcs;
            }
            _drawArcs(dimRadii, grd, "white");
            // Draw the levels by making the hole!
            _drawArcs(holeRadii, "white", "white");
        } else {
            // No inner levels - so just make a hole
            let holeRadii = [outInner];
            _drawArcs(holeRadii, "white", "white");
        }
    }

    function drawOuterDimensions() {
        if (outerDims.length() > 0) {
            let dimRadii = [];
            let colRadii = [];
            let scale = (outOuter - inOuter) / 100;
            let debug = "";
            for (let dim = 0; dim < outerDims.length(); dim++) {
                let levels = outerDims.get(dim).levels;
                // TODO support more than a single level!
                let arc = levels[0].value;
                let col = grd;
                if (_isNotNumber(arc)) {
                    arc = 100;
                    col = "lightgray";
                }
                // Colour arc up to level
                dimRadii[dim] = inOuter + (arc * scale);
                colRadii[dim] = col;
            }
            _drawArcs(dimRadii, colRadii, "white");

            drawDoughnut();

            // Overwrite doughnut to show negatives
            let arcStart = 0;
            let arcDegrees = (2 * Math.PI) / outerDims.length();
            scale = ((outDonut - inDonut) / 2) / 100;
            ctx.strokeStyle = "white";
            for (let dim = 0; dim < outerDims.length(); dim++) {
                let arcEnd = arcStart + arcDegrees;
                let levels = outerDims.get(dim).levels;
                // TODO: support more than single level
                let val = levels[0].value;
                if (val < 0) {
                    val = -val * scale;
                    ctx.lineWidth = val;
                    ctx.beginPath();
                    ctx.arc(middleX, middleY, outDonut - (val / 2), arcStart, arcEnd);
                    ctx.stroke();
                }
                arcStart = arcEnd;
            }
        } else {
            drawDoughnut();
        }
    }

    function drawLimits() {
        let dash = ctx.getLineDash();
        ctx.setLineDash([5]);
        ctx.strokeStyle = "gray";
        ctx.beginPath();
        ctx.arc(middleX, middleY, outOuter, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(middleX, middleY, inDonut + (outDonut - inDonut) / 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(middleX, middleY, inInner, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash(dash);
        ctx.strokeStyle = donutFrosting;
        ctx.beginPath();
        ctx.arc(middleX, middleY, outDonut, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.beginPath();
        // With fudge factor...
        ctx.arc(middleX, middleY, inDonut + 1, 0, 2 * Math.PI);
        ctx.stroke();
    }

    function setupCanvas() {
        ctx.font = textSize + "px Arial";
        ctx.textAlign = "center";
        ctx.lineWidth = 1;
        ctx.strokeStyle = "black";
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.shadowColor = "black";

        // Clear canvas
        ctx.beginPath();
        ctx.rect(0, 0, donutSize, donutSize);
        ctx.closePath();
        ctx.fillStyle = "white";
        ctx.fill();
    }

    function update() {
        document.getElementById("innerDims").innerHTML = "Inner: " + innerDims.string();
        document.getElementById("outerDims").innerHTML = "Outer: " + outerDims.string();
        let exportText = innerDims.export();
        if (exportText.length > 0) { exportText += "\n"; }
        exportText += outerDims.export();
        document.getElementById("csv").value = exportText;

        setupCanvas();
        drawOuterDimensions();
        drawInnerDimensions();
        drawLimits();
        drawLabels();
        ctx.fillStyle = "black";
        ctx.fillText("Doughnut", middleX, middleY - textSize);
        ctx.fillText("Economics", middleX, middleY + textSize)
    }
