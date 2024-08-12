export const body = document.getElementsByTagName("body")[0]
export const svg = document.getElementsByTagName("svg")[0]
svg.ns = svg.namespaceURI

export const dom_canvas = document.getElementById("dom_canvas")

export const get_bounds = (element) =>{
  let bounds = element.getBoundingClientRect()
  return bounds
}

export const get_style = (element) =>{
  return getComputedStyle(element)
}

export const create_svg = (type) =>{
  return document.createElementNS(svg.ns, type)
}

export const generate_path = (from_element, to_element) =>{
  let path = create_svg("line")
  let body_styles = get_style(body)

  if (from_element.parentElement != undefined) {

    let dom_canvas_rep = from_element.parentElement.parentElement
  
    let win_width = Math.floor(window.innerWidth)
    let win_height = Math.floor(window.innerHeight)
    let dom_canvas_rep_width = Math.floor(get_bounds(dom_canvas_rep).width)
    let dom_canvas_rep_height = Math.floor(get_bounds(dom_canvas_rep).height)
  
    let from_bounds = get_bounds(from_element)
    let to_bounds = get_bounds(to_element)
  
    let normal_x = parseInt(body_styles.paddingLeft.replace("px",""))
    let normal_y = parseInt(body_styles.paddingTop.replace("px",""))
    
    const from_pos_x = from_bounds.x + from_bounds.width/2 + normal_x + dom_canvas_rep_width-win_width
  
    // console.log(to_bounds.from_pos_x)
    const to_pos_x = to_bounds.x + to_bounds.width/2 + normal_x + dom_canvas_rep_width-win_width
  
    const from_pos_y = from_bounds.y + from_bounds.height/2 + normal_y + dom_canvas_rep_height-win_height
    const to_pos_y = to_bounds.y + to_bounds.height/2 + normal_y + dom_canvas_rep_height-win_height
  
    path.setAttribute("x1",from_pos_x)
    path.setAttribute("y1",from_pos_y)
    
    path.setAttribute("x2",to_pos_x)
    path.setAttribute("y2",to_pos_y)

    if (from_pos_x > -1, from_pos_y > -1, to_pos_x > -1, to_pos_y > -1) {
      svg.appendChild(path)
      
    }

    return path
  }

  // path.setAttribute("style",`stroke:${color};`)
  
  return null
}