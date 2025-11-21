import classes from "./SvgButton.module.css";

type Props = React.HTMLAttributes<HTMLButtonElement> & {
  buttonClassNames: string;
  viewBox: string;
  svgClassNames?: string;
  outlinedPath?: string;
  outlinedClassNames?: string;
  filledPath?: string;
  filledClassNames?: string;
}

export const SvgButton = ({
  buttonClassNames,
  viewBox,
  svgClassNames,
  outlinedPath,
  outlinedClassNames,
  filledPath, 
  filledClassNames,
  ...rest
}: Props) => (
  <button className={`${classes.button} ${buttonClassNames}`} {...rest}>
    <svg
      className={`${classes.svgImage} ${svgClassNames}`}
      viewBox={viewBox}
      xmlns="http://www.w3.org/2000/svg"
    >
      {outlinedPath && (
        <path
          className={`${outlinedClassNames}`}
          d={outlinedPath} />
      )}
      {filledPath && (
        <path
          className={`${filledClassNames}`}
          d={filledPath} />
      )}
    </svg>
  </button>
)