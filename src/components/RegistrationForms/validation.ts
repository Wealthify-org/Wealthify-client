export const validateEmail = (email: string): boolean => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  }

export const validatePassword = (password: string): boolean => {
    return password.length >= 6
  }