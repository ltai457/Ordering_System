import { describe, it, expect } from 'vitest'
import { loginFormInitialState, validateLoginForm } from './loginFormModel'

describe('Login Form Model', () => {
  describe('loginFormInitialState', () => {
    it('has empty username and password fields', () => {
      expect(loginFormInitialState).toEqual({
        username: '',
        password: '',
      })
    })
  })

  describe('validateLoginForm', () => {
    it('returns no errors for valid form', () => {
      const validForm = {
        username: 'admin',
        password: 'password123',
      }

      const errors = validateLoginForm(validForm)

      expect(errors).toEqual({})
      expect(Object.keys(errors).length).toBe(0)
    })

    it('returns error when username is empty', () => {
      const invalidForm = {
        username: '',
        password: 'password123',
      }

      const errors = validateLoginForm(invalidForm)

      expect(errors.username).toBe('Username is required')
      expect(errors.password).toBeUndefined()
    })

    it('returns error when password is empty', () => {
      const invalidForm = {
        username: 'admin',
        password: '',
      }

      const errors = validateLoginForm(invalidForm)

      expect(errors.password).toBe('Password is required')
      expect(errors.username).toBeUndefined()
    })

    it('returns errors for both fields when both are empty', () => {
      const invalidForm = {
        username: '',
        password: '',
      }

      const errors = validateLoginForm(invalidForm)

      expect(errors.username).toBe('Username is required')
      expect(errors.password).toBe('Password is required')
    })

    it('returns error when username contains only whitespace', () => {
      const invalidForm = {
        username: '   ',
        password: 'password123',
      }

      const errors = validateLoginForm(invalidForm)

      expect(errors.username).toBe('Username is required')
    })

    it('returns error when password contains only whitespace', () => {
      const invalidForm = {
        username: 'admin',
        password: '   ',
      }

      const errors = validateLoginForm(invalidForm)

      expect(errors.password).toBe('Password is required')
    })

    it('accepts username and password with leading/trailing spaces if they contain non-whitespace', () => {
      const validForm = {
        username: '  admin  ',
        password: '  password123  ',
      }

      const errors = validateLoginForm(validForm)

      expect(Object.keys(errors).length).toBe(0)
    })
  })
})
