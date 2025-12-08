import classes from "./MeshGradientButton.module.css"

type MeshGradientButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  title: string
}

const MeshGradientButton = ({title, ...props}: MeshGradientButtonProps) => {
  return (
    <button className={classes.meshGradientButton} {...props}>
      <div className={classes.shapesContainer} aria-hidden="true">
        <span className={classes.blob}></span>
        <span className={classes.blob}></span>
        <span className={classes.blob}></span>
      </div>
      <span className={classes.text}>{title}</span>
    </button>
  ) 
}

export default MeshGradientButton