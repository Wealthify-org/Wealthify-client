import classes from "./IndexCard.module.css";

type Props = {
  children: React.ReactNode;
  title: string;
  className?: string;
}

export const IndexCard = ({ children, title, className }: Props) => {
  return (
    <li className={`${classes.indexCard} ${className ?? ""}`}>
      <article className={classes.indexCardContents}>
        <h3 className={classes.title}>{title}</h3>
        {children}
      </article>
    </li>
  );
};