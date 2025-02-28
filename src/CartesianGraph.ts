import { Assets, ColorSource, Container, FillInput, Graphics, Sprite, Text, Texture } from "pixi.js";


export enum TICK_TYPES {
    numeric, // Integers, floats etc.
    radians, // PI PI/4 etc
    degrees  // 0, 45, 90 (min 5 degree increments)
}

export interface FunctionToDrawOptions {
    functionToDraw: (x: number) => number
    label: string
    computedPoints?: Array<{ x: number, y: number }>
    color?: ColorSource
}

export interface CartesianGraphOptions {
    requestedWidth: number
    requestedHeight: number

    minX: number
    maxX: number

    functionsToDraw: Array<FunctionToDrawOptions>

    xTickType?: TICK_TYPES
    yTickType?: TICK_TYPES

    givenMinY?: number
    givenMaxY?: number

    includeMinorYTickLabels?: boolean
    given_y_unit_to_px_size?: number
}

export default class CartesianGraph extends Container {
    private minY: number;
    private maxY: number;

    // Multiplier used for scaling x graph unit to pixels
    get unit_to_px_size() {
        return this.opts.requestedWidth / (this.opts.maxX - this.opts.minX)
    }

    // Multipler used for scaling y graph unit to pixels
    get y_unit_to_px_size() {
        if (this.opts.given_y_unit_to_px_size) return this.opts.given_y_unit_to_px_size


        return this.opts.requestedHeight / (this.maxY - this.minY)
    }

    constructor(public opts: CartesianGraphOptions = {
        requestedHeight: 500,
        requestedWidth: 500,
        functionsToDraw: [{
            functionToDraw: (x) => Math.pow(x, 2),
            label: "x^2"
        }],
        minX: -10,
        maxX: 10,
        xTickType: TICK_TYPES.numeric,
        yTickType: TICK_TYPES.numeric,
        includeMinorYTickLabels: false
    }) {
        super();

        this.generatePlottablePoints()

        // todo: make this handle all functions ideally and use max from largest, should be able to just combine
        // all points to find highest/lowest in the set still
        let sortedByY = this.opts.functionsToDraw[0].computedPoints!.slice().sort((a, b) => a.y - b.y)

        this.minY = sortedByY[0].y
        if (this.opts.givenMinY) {
            this.minY = this.opts.givenMinY
        }

        this.maxY = sortedByY[sortedByY.length - 1].y
        if (this.opts.givenMaxY) {
            this.maxY = this.opts.givenMaxY
        }

        console.log(`maxY: ${this.maxY}, miny: ${this.minY}`)

        this.minY = - Math.max(this.maxY, this.minY)
        this.maxY = Math.max(this.maxY, this.minY)
        console.log(`adjusted maxY: ${this.maxY}, miny: ${this.minY}`)

        this.drawGraphBackground()
        this.drawAxes()
        this.drawFunctionLine()
        // let rawSVGElement = MathJax.tex2svg(this.opts.functionsToDraw[0].label)


        // let svgString = rawSVGElement.innerHTML.replaceAll('currentColor', 'black')


        // let htmlNOde = document.createElement('svg')

        // htmlNOde.innerHTML = svgString
        // htmlNOde.children[0].setAttribute('width', '20rem')
        // htmlNOde.children[0].setAttribute('height', '2rem')
        // document.body.appendChild(htmlNOde)

        // console.log(htmlNOde.children[0].outerHTML)

        // let graphedFunctionTitle = new Graphics().svg(htmlNOde.children[0].outerHTML)


        // let graphedFunctionTitle = new Graphics().svg(svgElem.outerHTML)


        // graphedFunctionTitle.y = 20
        // graphedFunctionTitle.x = -500

        // this.addChild(graphedFunctionTitle)
        this.init()
    }

    private async init() {
        const FUNC_LABEL_HEIGHT = 40
        const VISUAL_SCALE = 1.5
        for (let i = 0; i < this.opts.functionsToDraw.length; i++) {
            const funcToDraw = this.opts.functionsToDraw[i];
            
            let encodedFunc = encodeURIComponent(funcToDraw.label)

            let funcColor = encodeURIComponent(funcToDraw?.color as string) || "black"
            console.info(funcColor)
            let svgTexture:Texture = await Assets.load({
                src: `http://localhost:3000/tex2svg.svg?tex=${encodedFunc}&color=${funcColor}`,
                data: {
                    resolution: 2
                }
            })

            const funcLabelBG = new Graphics()
            funcLabelBG.y = 5 + i*FUNC_LABEL_HEIGHT
            funcLabelBG.x = 10
            funcLabelBG.rect(0,0, svgTexture.width*VISUAL_SCALE, FUNC_LABEL_HEIGHT - 5 )
            funcLabelBG.fill("#00000033")
            this.addChild(funcLabelBG)

            const mySprite = new Sprite(svgTexture);
            mySprite.y = 10 + i*FUNC_LABEL_HEIGHT
            mySprite.x = 10
            mySprite.scale = VISUAL_SCALE
            this.addChild(mySprite)
        }
    }

    private uToPx(units: number) { return units * this.unit_to_px_size }
    private uToPxy(units: number) { return units * this.y_unit_to_px_size }

    private drawGraphBackground() {
        const backgroundGrid = new Graphics();
        backgroundGrid.rect(0, 0, this.opts.requestedWidth, this.opts.requestedHeight)
        backgroundGrid.fill(0xffffff)
        this.addChild(backgroundGrid)
    }

    private drawAxes() {
        const axesGraphics = new Graphics();

        axesGraphics.moveTo(0, Math.floor(this.opts.requestedHeight / 2))
        axesGraphics.lineTo(this.opts.requestedWidth, Math.floor(this.opts.requestedHeight / 2))
        this.drawXTicks(axesGraphics)

        axesGraphics.moveTo(Math.floor(this.opts.requestedWidth / 2), 0)
        axesGraphics.lineTo(Math.floor(this.opts.requestedWidth / 2), this.opts.requestedHeight)

        this.drawYTicks(axesGraphics)
        axesGraphics.stroke({
            color: 0xCCCCCC,
            width: 1
        })

        this.addChild(axesGraphics)
    }

    private drawXTicks(axesGraphics: Graphics) {
        // Getting number of ticks in one direction since will do
        // 2 at a time one positive, one negative
        // Using graph units
        const TICK_LENGTH = 4;
        const MAJOR_TICK_INTERVAL = 5;


        let numTicks = (this.opts.maxX - this.opts.minX) / 2;

        if (this.opts.xTickType === TICK_TYPES.radians) {
            numTicks = (this.opts.maxX - this.opts.minX) / (Math.PI / 2)
        }

        const middleY = this.opts.requestedHeight / 2;
        const middleX = this.opts.requestedWidth / 2;

        const xTickSpacing = this.opts.requestedWidth / 2 / numTicks

        for (let currentTick = 0; currentTick <= numTicks; currentTick++) {
            let tickLength = TICK_LENGTH;

            if (currentTick % MAJOR_TICK_INTERVAL == 0)
                tickLength *= 2

            // Draws ticks on the x axis to left of origin
            axesGraphics.moveTo(middleX - currentTick * xTickSpacing, middleY + tickLength + 1);
            axesGraphics.lineTo(middleX - currentTick * xTickSpacing, middleY - tickLength);

            // Draw labels
            if (currentTick != 0 && currentTick < numTicks) {
                axesGraphics.addChild(new Text({
                    text: -currentTick,
                    x: middleX - currentTick * xTickSpacing - 5,
                    y: middleY + 10,
                    style: {
                        fontSize: 14,
                        fill: 0xcccccc
                    }
                }))
            }

            // Draws ticks on the x axis to right of origin
            axesGraphics.moveTo(middleX + currentTick * xTickSpacing, middleY + tickLength + 1);
            axesGraphics.lineTo(middleX + currentTick * xTickSpacing, middleY - tickLength);
            // Draw labels
            if (currentTick != 0 && currentTick < numTicks) {
                let tickLabel = `${currentTick}`
                if (this.opts.xTickType === TICK_TYPES.radians) {
                    if (currentTick == 1) {
                        tickLabel = `π/4`
                    }
                    else if (currentTick == 2) {
                        tickLabel = `π/2`
                    } else {
                        tickLabel = `${currentTick}π/4`
                    }
                }
                axesGraphics.addChild(new Text({
                    text: tickLabel,
                    x: middleX + currentTick * xTickSpacing - 5,
                    y: middleY + 10,
                    style: {
                        fontSize: 14,
                        fill: 0xcccccc
                    }
                }))
            }
        }
    }

    private drawYTicks(axesGraphics: Graphics) {
        // Getting number of ticks in one direction since will do
        // 2 at a time one positive, one negative
        const TICK_LENGTH = 4;
        const MAJOR_TICK_INTERVAL = 5;

        let numTicks = (this.maxY - this.minY) / 2;
        if (this.opts.given_y_unit_to_px_size) {
            numTicks = this.opts.requestedHeight / this.opts.given_y_unit_to_px_size / 2
        }

        const middleY = this.opts.requestedHeight / 2;
        const middleX = this.opts.requestedWidth / 2;

        const yTickSpacing = this.opts.requestedHeight / 2 / numTicks

        for (let currentTick = 0; currentTick <= numTicks; currentTick++) {
            let tickLength = TICK_LENGTH;

            if (currentTick % MAJOR_TICK_INTERVAL == 0)
                tickLength *= 2

            //Draw ticks above the x-axis
            axesGraphics.moveTo(middleX + tickLength + 1, middleY - currentTick * yTickSpacing);
            axesGraphics.lineTo(middleX - tickLength, middleY - currentTick * yTickSpacing);

            if (currentTick != 0 && (this.opts.includeMinorYTickLabels || currentTick % MAJOR_TICK_INTERVAL == 0)) {
                axesGraphics.addChild(new Text({
                    text: currentTick,
                    x: middleX + 10,
                    y: middleY - currentTick * yTickSpacing - 7,
                    style: {
                        fontSize: 14,
                        fill: 0xcccccc
                    }
                }))
            }

            // Draw ticks below the x axis
            axesGraphics.moveTo(middleX + tickLength + 1, middleY + currentTick * yTickSpacing);
            axesGraphics.lineTo(middleX - tickLength, middleY + currentTick * yTickSpacing);

            if (currentTick != 0 && (this.opts.includeMinorYTickLabels || currentTick % MAJOR_TICK_INTERVAL == 0)) {
                axesGraphics.addChild(new Text({
                    text: -currentTick,
                    x: middleX + 10,
                    y: middleY + currentTick * yTickSpacing - 10,
                    style: {
                        fontSize: 14,
                        fill: 0xcccccc
                    }
                }))
            }
        }
    }

    private generatePlottablePoints() {
        this.opts.functionsToDraw.forEach(functionInfo => {

            let points = [];
            let intervalBetweenPoints = (this.opts.maxX - this.opts.minX) / this.opts.requestedWidth

            for (let x = this.opts.minX; x <= this.opts.maxX; x += intervalBetweenPoints) {
                points.push({ x, y: functionInfo.functionToDraw(x) })
            }
            console.log(points)
            functionInfo.computedPoints = points

        })
    }

    private drawFunctionLine() {
        const dfg = new Graphics();

        const middleY = this.opts.requestedHeight / 2;
        const middleX = this.opts.requestedWidth / 2;

        this.opts.functionsToDraw.forEach(functionInfo => {

            let hasMovedFirst = false

            for (let i = 0; i < functionInfo.computedPoints!.length; i++) {
                const point = functionInfo.computedPoints![i];
                const xScreenPos = middleX + this.uToPx(point.x);
                const yScreenPos = middleY - this.uToPxy(point.y);

                if (xScreenPos >= 0 && xScreenPos <= this.opts.requestedWidth && yScreenPos >= 0 && yScreenPos <= this.opts.requestedHeight)
                    // First point in set we move to remainder we draw to
                    if (!hasMovedFirst) {
                        dfg.moveTo(xScreenPos, yScreenPos)
                        hasMovedFirst = true
                    }
                    else {
                        dfg.lineTo(xScreenPos, yScreenPos)
                    }
            }

            let chosenColor: ColorSource = '#000000';

            if (functionInfo.color)
                chosenColor = functionInfo.color

            dfg.stroke({
                color: chosenColor,
                width: 2
            })
        })

        this.addChild(dfg)
    }
}