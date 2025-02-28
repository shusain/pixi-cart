import { mathjax } from 'mathjax-full/js/mathjax'
// import { MathML} from 'mathjax-full/js/input/mathml'
import { TeX } from 'mathjax-full/js/input/tex'
import { SVG } from 'mathjax-full/js/output/svg'
import { liteAdaptor } from 'mathjax-full/js/adaptors/liteAdaptor'
import { RegisterHTMLHandler } from 'mathjax-full/js/handlers/html'
import express from 'express';
import cors from 'cors'

const adaptor = liteAdaptor()
RegisterHTMLHandler(adaptor)

const mathjax_document = mathjax.document('', {
  InputJax: new TeX(),
  OutputJax: new SVG({ fontCache: 'none' })
})

const mathjax_options = {
  em: 16,
  ex: 8,
  containerWidth: 1280
}

export function get_mathjax_svg(math: string): string {
  const node = mathjax_document.convert(math, mathjax_options)
  return adaptor.innerHTML(node)
}

// console.log(get_mathjax_svg('\\frac{a}{1-a^2}'))


const app = express()
const port = 3000

app.use(cors())

app.get('/tex2svg.svg', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml')
  console.log(`Rendering new SVG for: ${req.query.tex}`)
  let svgString = get_mathjax_svg(req.query.tex as string)
  // console.log(svgString)
  // console.log(svgString.replaceAll("currentColor", color))
  let color = req?.query?.color as string || "blue"

  res.send(svgString.replaceAll("currentColor", color))
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})