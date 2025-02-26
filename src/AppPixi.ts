import { Application, Rectangle } from 'pixi.js';
import CartesianGraph, { TICK_TYPES } from './CartesianGraph';

async function init ()
{
    window.addEventListener('keydown', (event)=>{ console.log(event)})
    window.addEventListener('keyup', (event)=>{ console.log(event)})

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
                    label: "sin(x)"
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
            minX: -2*Math.PI,
            maxX: 2*Math.PI,
            functionsToDraw: [
                {
                    functionToDraw: (x) => Math.cos(x),
                    label: "cos(x)"
                }
            ],
            xTickType:TICK_TYPES.radians,
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
                    label: "abs(x)"
                },
                {
                    functionToDraw: (x) => -Math.abs(x),
                    label: "abs(x)"
                },
                {
                    functionToDraw: (x) => 1.5*x+Math.sin(x),
                    label: "sin(x)",
                    color: 0xff0000
                },
                {
                    functionToDraw: (x) => Math.cos(x),
                    label: "cos(x)",
                    color: 0x0000ff
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
                    label: "f(x) = 2 * (x-1)^2 + 2"
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