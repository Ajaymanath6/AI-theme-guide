import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-project-card',
  imports: [RouterLink],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss'
})
export class ProjectCardComponent {
  projectId = input.required<string | number>();
  title = input.required<string>();
  subtitle = input<string>('');
  createdDate = input<string>('Jan 3, 2024');
  isPinned = input<boolean>(false);

  keep = output<void>();
  pin = output<void>();
  edit = output<void>();
  copyId = output<void>();
  delete = output<void>();

  onKeep(event: Event): void {
    event.preventDefault();
    this.keep.emit();
  }

  onPin(event: Event): void {
    event.preventDefault();
    this.pin.emit();
  }

  onEdit(event: Event): void {
    event.preventDefault();
    this.edit.emit();
  }

  onCopyId(event: Event): void {
    event.preventDefault();
    this.copyId.emit();
  }

  onDelete(event: Event): void {
    event.preventDefault();
    this.delete.emit();
  }
}
