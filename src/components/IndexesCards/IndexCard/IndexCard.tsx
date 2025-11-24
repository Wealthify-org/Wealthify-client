import classes from "./IndexCard.module.css";

type Props = {
  children: React.ReactNode;
  title: string;
  className?: string;
  isLoading?: boolean;
  isMainIndexesCard?: boolean;
}

export const IndexCard = ({ children, title, className, isLoading = false}: Props) => {

  return (
    <li className={`${classes.indexCard} ${className ?? ""}`}>
      <article className={classes.indexCardContents}>
        <h3 className={classes.title}>{title}</h3>
        {isLoading ? (
          <>
            <div className={classes.skeletonBlock} />
            <div className={classes.skeletonLine} />
          </>
        ) : (
          children
        )}
      </article>
    </li>
  );
};