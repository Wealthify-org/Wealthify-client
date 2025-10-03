import SignInForm from "@/components/RegistrationForms/SignInForm";
import AbstractBackgroundShapes from "@/components/UI/abstractBackgroundShapes/AbstractBackgroundShapes";
import classes from '@/app/(auth)/auth.module.css'

export default function SignInPage() {
  return (
    <main className={classes.authPage}>
      <div className={classes.authCard}>
        <SignInForm variant="page" />
      </div>
      <AbstractBackgroundShapes />
    </main>
  )
}