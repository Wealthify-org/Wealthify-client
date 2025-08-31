import classes from "./AbstractBackgroundShapes.module.css"

const AbstractBackgroundShapes = () => {
  return (
    <div className={classes.shapesBackgroundContainer} aria-hidden='true'>
      <div className={classes.abstractShape} />
      <div className={classes.abstractShape} />
      <div className={classes.abstractShape} />
    </div>
  )
}

export default AbstractBackgroundShapes