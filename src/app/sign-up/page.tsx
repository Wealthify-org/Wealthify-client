import SignUpForm from "@/components/RegistrationForms/SignUpForm";
import AbstractBackgroundShapes from "@/components/UI/abstractBackgroundShapes/AbstractBackgroundShapes";
import classes from '@/components/UI/registrationModal/RegistrationModal.module.css'

export default function SignUpPage() {
  return (
    <main className={classes.authPage}>
      <div className={classes.authCard}>
        <SignUpForm variant="page" />
      </div>
      <AbstractBackgroundShapes />
    </main>
  )
}