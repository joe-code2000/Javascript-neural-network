export const layer_element = (class_name = "layer_div") =>{
  const element = document.createElement("div")
  element.setAttribute("class",class_name);

  return element
}