const ColorButton = ({ color, onClick = (color, e) => { } }) => {
  return (
    <button style={{ backgroundColor: color }} onClick={(e) => {onClick(color, e)}} className="h-4 w-12 border" />
  );
};

export default ColorButton;
