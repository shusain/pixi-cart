import { Application, Rectangle } from 'pixi.js';
import CartesianGraph, { TICK_TYPES } from './CartesianGraph';

async function init ()
{
    // Create a new application
    const app = new Application();

    // Initialize the application
    await app.init({ background: '#1099bb', resizeTo: window, antialias:true});

    // Append the application canvas to the document body
    document.body.appendChild(app.canvas);

    // Setting up global stage click handler
    app.stage.eventMode = "static"
    app.stage.interactive = true
    app.stage.hitArea = new Rectangle(0, 0, window.screen.width, window.screen.height)

    const cartGraph = new CartesianGraph(
        {
            requestedWidth: 500,
            requestedHeight: 500,
            minX: -Math.PI,
            maxX: Math.PI,
            functionsToDraw: [
                {
                    functionToDraw: (x) => Math.sin(x),
                    label: "f(x)\\; = \\sin(x)",
                    color: "blue"
                },
                {
                    functionToDraw: (x) => Math.cos(x),
                    label: "f(x)\\; = \\cos(x)",
                    color: "green"
                }
            ],
            xTickType:TICK_TYPES.radians,
            includeMinorYTickLabels: true
        }
    )    
    app.stage.addChild(cartGraph)


    const cartGraph2 = new CartesianGraph(
        {
            requestedWidth: 500,
            requestedHeight: 500,
            minX: -10,
            maxX: 10,
            functionsToDraw: [
                {
                    functionToDraw: (x) => {
                        let m = 1.5 //slope
                        let b = 2   // y-intercept
                        return m*x + b;
                    },
                    label: `f(x)\\; = mx + b; m = 1.5; b = 2;`
                }
            ],
            xTickType:TICK_TYPES.numeric,
            includeMinorYTickLabels: true
        }
    )

    cartGraph2.x = 510
    app.stage.addChild(cartGraph2)
    
    const cartGraph3 = new CartesianGraph(
        {
            requestedWidth: 500,
            requestedHeight: 500,
            minX: -10,
            maxX: 10,
            functionsToDraw: [
                {
                    functionToDraw: (x) => Math.abs(x),
                    label: "f(x)\\; = |x|",
                    color: "#aa00aa"
                },
                {
                    functionToDraw: (x) => -Math.abs(x),
                    label: "f(x) = -|x|"
                },
                {
                    functionToDraw: (x) => 1.5*x+Math.sin(x),
                    label: `f(x) = 1.5x + \\sin(x)`,
                    color: '#ff0000'
                },
                {
                    functionToDraw: (x) => Math.cos(x),
                    label: `f(x) = \\cos(x)`,
                    color: '#0000ff'
                }
            ],
            includeMinorYTickLabels: true
        }
    )

    cartGraph3.y = 510
    app.stage.addChild(cartGraph3)

    cartGraph2.x = 510
    app.stage.addChild(cartGraph2)
    
    const cartGraph4 = new CartesianGraph(
        {
            requestedWidth: 500,
            requestedHeight: 500,
            minX: -5,
            maxX: 5,
            functionsToDraw: [
                {
                    functionToDraw: (x) => 2*Math.pow(x-1,2)+2,
                    label: "f(x)\\; = 2 * (x-1)^2 + 2"
                }
            ],
            given_y_unit_to_px_size: 40
        }
    )

    cartGraph4.x = 510
    cartGraph4.y = 510
    app.stage.addChild(cartGraph4)
};

init();