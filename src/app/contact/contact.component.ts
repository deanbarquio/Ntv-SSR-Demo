// Import Angular core modules for component functionality
import { Component, signal } from '@angular/core';
// Import common directives for template functionality
import { CommonModule } from '@angular/common';
// Import forms module for form handling
import { FormsModule } from '@angular/forms';

/**
 * Contact Form Interface - Defines the structure of form data
 * This interface is used for both SSR and CSR form handling
 */
interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  newsletter: boolean;
}

/**
 * Form Errors Interface - Defines validation error structure
 * This is primarily used for client-side validation
 */
interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

/**
 * Contact Component - SSR vs CSR Form Handling Demonstration
 * 
 * This component demonstrates two different approaches to form handling:
 * 1. SSR Form: Server-rendered form with basic functionality
 * 2. CSR Form: Client-side form with advanced validation and interactivity
 * 
 * SSR Form Features:
 * - Server-rendered form structure
 * - Basic form submission simulation
 * - SEO-friendly form content
 * - Works without JavaScript
 * 
 * CSR Form Features:
 * - Real-time validation
 * - Interactive form feedback
 * - Advanced error handling
 * - Enhanced user experience
 * 
 * Key SSR/CSR Patterns:
 * 1. Dual form approach (SSR + CSR)
 * 2. Progressive enhancement
 * 3. Server vs client validation
 * 4. Different user experiences based on environment
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss'
})
export class ContactComponent {
  // SSR Detection Signal: Determines execution environment
  protected readonly isServer = signal(typeof window === 'undefined');
  
  // Mixed SSR/CSR Signal: Initial time rendered on server, static on client
  protected readonly currentTime = signal(new Date().toLocaleString());
  
  // ===== SSR FORM DATA =====
  // These signals handle the server-rendered form with basic functionality
  
  protected readonly formData = signal<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    newsletter: false
  });
  protected readonly isSubmitting = signal(false);
  protected readonly submitSuccess = signal(false);

  // ===== CSR FORM DATA =====
  // These signals handle the client-side form with advanced features
  
  protected readonly csrFormData = signal<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
    newsletter: false
  });
  protected readonly csrErrors = signal<FormErrors>({});
  protected readonly isCSRSubmitting = signal(false);
  protected readonly csrSubmitSuccess = signal(false);

  // ===== SSR FORM METHODS =====
  // These methods handle the server-rendered form functionality
  
  /**
   * Update name field in SSR form
   * Basic form field update without validation
   */
  protected updateName(value: string) {
    this.formData.update(data => ({ ...data, name: value }));
  }

  /**
   * Update email field in SSR form
   * Basic form field update without validation
   */
  protected updateEmail(value: string) {
    this.formData.update(data => ({ ...data, email: value }));
  }

  /**
   * Update subject field in SSR form
   * Basic form field update without validation
   */
  protected updateSubject(value: string) {
    this.formData.update(data => ({ ...data, subject: value }));
  }

  /**
   * Update message field in SSR form
   * Basic form field update without validation
   */
  protected updateMessage(value: string) {
    this.formData.update(data => ({ ...data, message: value }));
  }

  /**
   * Update newsletter checkbox in SSR form
   * Basic form field update without validation
   */
  protected updateNewsletter(value: boolean) {
    this.formData.update(data => ({ ...data, newsletter: value }));
  }

  /**
   * Handle SSR form submission
   * Demonstrates different behavior on server vs client
   */
  protected onSubmit() {
    if (this.isServer()) {
      // Server-side: simulate form processing
      // This would typically handle form data on the server
      console.log('SSR Form submitted on server:', this.formData());
      this.submitSuccess.set(true);
    } else {
      // Client-side: simulate server-side processing
      // This demonstrates how SSR forms work after hydration
      this.isSubmitting.set(true);
      setTimeout(() => {
        console.log('SSR Form submitted on client:', this.formData());
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.resetSSRForm();
      }, 2000);
    }
  }

  /**
   * Reset SSR form to initial state
   * Clears all form fields after successful submission
   */
  private resetSSRForm() {
    this.formData.set({
      name: '',
      email: '',
      subject: '',
      message: '',
      newsletter: false
    });
  }

  // ===== CSR FORM METHODS =====
  // These methods handle the client-side form with advanced features
  
  /**
   * Update name field in CSR form with validation
   * Includes real-time validation feedback
   */
  protected updateCSRName(value: string) {
    this.csrFormData.update(data => ({ ...data, name: value }));
    this.validateField('name', value);
  }

  /**
   * Update email field in CSR form with validation
   * Includes real-time validation feedback
   */
  protected updateCSREmail(value: string) {
    this.csrFormData.update(data => ({ ...data, email: value }));
    this.validateField('email', value);
  }

  /**
   * Update subject field in CSR form with validation
   * Includes real-time validation feedback
   */
  protected updateCSRSubject(value: string) {
    this.csrFormData.update(data => ({ ...data, subject: value }));
    this.validateField('subject', value);
  }

  /**
   * Update message field in CSR form with validation
   * Includes real-time validation feedback
   */
  protected updateCSRMessage(value: string) {
    this.csrFormData.update(data => ({ ...data, message: value }));
    this.validateField('message', value);
  }

  /**
   * Update newsletter checkbox in CSR form
   * No validation needed for boolean field
   */
  protected updateCSRNewsletter(value: boolean) {
    this.csrFormData.update(data => ({ ...data, newsletter: value }));
  }

  /**
   * Validate individual form fields
   * Provides real-time validation feedback for CSR form
   */
  protected validateField(field: keyof FormErrors, value: string) {
    const errors = { ...this.csrErrors() };
    
    switch (field) {
      case 'name':
        if (!value.trim()) {
          errors.name = 'Name is required';
        } else if (value.trim().length < 2) {
          errors.name = 'Name must be at least 2 characters';
        } else {
          delete errors.name;
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          errors.email = 'Email is required';
        } else if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
        
      case 'subject':
        if (!value) {
          errors.subject = 'Please select a subject';
        } else {
          delete errors.subject;
        }
        break;
        
      case 'message':
        if (!value.trim()) {
          errors.message = 'Message is required';
        } else if (value.trim().length < 10) {
          errors.message = 'Message must be at least 10 characters';
        } else {
          delete errors.message;
        }
        break;
    }
    
    this.csrErrors.set(errors);
  }

  /**
   * Handle CSR form submission with validation
   * Demonstrates advanced client-side form handling
   */
  protected onCSRSubmit() {
    // Client-side validation - validate all fields
    this.validateField('name', this.csrFormData().name);
    this.validateField('email', this.csrFormData().email);
    this.validateField('subject', this.csrFormData().subject);
    this.validateField('message', this.csrFormData().message);

    // Check if there are any validation errors
    if (Object.keys(this.csrErrors()).length > 0) {
      console.log('CSR Form has validation errors:', this.csrErrors());
      return;
    }

    // Simulate client-side form processing
    this.isCSRSubmitting.set(true);
    setTimeout(() => {
      console.log('CSR Form submitted successfully:', this.csrFormData());
      this.isCSRSubmitting.set(false);
      this.csrSubmitSuccess.set(true);
      this.resetCSRForm();
    }, 1500);
  }

  /**
   * Reset CSR form to initial state
   * Clears all form fields and validation errors
   */
  private resetCSRForm() {
    this.csrFormData.set({
      name: '',
      email: '',
      subject: '',
      message: '',
      newsletter: false
    });
    this.csrErrors.set({});
  }
}
