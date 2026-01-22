import { Component, output, signal, effect, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-command-bar',
  imports: [CommonModule, FormsModule],
  templateUrl: './command-bar.component.html',
  styleUrl: './command-bar.component.scss'
})
export class CommandBarComponent implements AfterViewInit {
  @ViewChild('inputElement') inputElement!: ElementRef<HTMLInputElement>;
  
  command = signal<string>('');
  showSuggestion = signal<boolean>(false);
  showCopiedMessage = signal<boolean>(false);
  
  commandSent = output<string>();
  
  // The canvas component path
  public readonly canvasPath = 'angular-tailwind-flowbite-app/src/app/pages/components-canvas/components-canvas.component.html';
  
  constructor() {
    // Watch for "@" to show suggestion
    effect(() => {
      const cmd = this.command();
      this.showSuggestion.set(cmd.includes('@') && cmd.trim().endsWith('@'));
    });
  }
  
  ngAfterViewInit() {
    setTimeout(() => {
      this.inputElement?.nativeElement?.focus();
    }, 100);
  }
  
  onInput(event: Event): void {
    this.command.set((event.target as HTMLInputElement).value);
  }
  
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.command().trim()) {
      event.preventDefault();
      this.sendCommand();
    } else if (event.key === 'Tab' && this.showSuggestion()) {
      event.preventDefault();
      this.insertPath();
    }
  }
  
  insertPath(): void {
    const cmd = this.command();
    const atIndex = cmd.lastIndexOf('@');
    if (atIndex !== -1) {
      const beforeAt = cmd.substring(0, atIndex);
      this.command.set(beforeAt + '@' + this.canvasPath + ' ');
      this.showSuggestion.set(false);
      setTimeout(() => {
        const input = this.inputElement?.nativeElement;
        if (input) {
          input.focus();
          input.setSelectionRange(input.value.length, input.value.length);
        }
      }, 0);
    }
  }
  
  async sendCommand(): Promise<void> {
    let cmd = this.command().trim();
    if (!cmd) return;
    
    // If command doesn't start with @, prepend the canvas path
    if (!cmd.startsWith('@')) {
      cmd = '@' + this.canvasPath + ' ' + cmd;
    }
    
    // Copy to clipboard and send to Cursor chat
    await this.sendToCursor(cmd);
    
    // Emit event
    this.commandSent.emit(cmd);
    
    // Clear input
    this.command.set('');
    this.showSuggestion.set(false);
  }
  
  private async sendToCursor(command: string): Promise<void> {
    // Check if we're in local development (localhost)
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '';
    
    if (isLocalhost) {
      // LOCAL: Send to component helper endpoint
      try {
        const response = await fetch('http://localhost:4202/send-to-cursor-chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ command })
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Command sent to Cursor via local endpoint:', command);
          console.log('📝 Method:', result.method || result.note);
          
          // Show success message
          this.showCopiedMessage.set(true);
          setTimeout(() => {
            this.showCopiedMessage.set(false);
          }, 3000);
        } else {
          throw new Error(result.error || 'Failed to send command');
        }
      } catch (error: any) {
        console.error('❌ Failed to send to local endpoint:', error);
        
        // Fallback to clipboard if local endpoint fails
        await this.copyToClipboard(command);
      }
    } else {
      // PRODUCTION: Just copy to clipboard
      await this.copyToClipboard(command);
    }
  }
  
  private async copyToClipboard(command: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(command);
      console.log('✅ Command copied to clipboard:', command);
      
      // Show "Copied!" message
      this.showCopiedMessage.set(true);
      setTimeout(() => {
        this.showCopiedMessage.set(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
      // Fallback: try old clipboard API
      try {
        const textArea = document.createElement('textarea');
        textArea.value = command;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        this.showCopiedMessage.set(true);
        setTimeout(() => {
          this.showCopiedMessage.set(false);
        }, 2000);
        
        console.log('✅ Command copied to clipboard (fallback):', command);
      } catch (fallbackErr) {
        console.error('Fallback clipboard copy also failed:', fallbackErr);
        alert(`Command: ${command}\n\n(Please copy this manually)`);
      }
    }
  }
}
