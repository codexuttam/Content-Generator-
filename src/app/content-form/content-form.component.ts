import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, output, signal, ViewChild, Renderer2 } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ContentService } from './content.service';

interface ContentType {
  id: string;
  label: string;
}

interface ToneType {
  id: string;
  label: string;
}

@Component({
  selector: 'app-content-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './content-form.component.html',
  styleUrl: './content-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentFormComponent {
  outputChange = output<string>();
  generatingChange = output<boolean>();

  private service = inject(ContentService);

  topic = signal('');
  keywords = signal('');
  selectedContentType = signal('blog_post');
  selectedTone = signal('casual');
  isGenerating = signal(false);

  contentTypes: ContentType[] = [
    { id: 'blog_post', label: 'Blog Post Outline' },
    { id: 'social_media_update', label: 'Social Media Captions' },
    { id: 'product_description', label: 'Product Description' },
    { id: 'email_draft', label: 'Email Draft' },
  ];

  toneTypes: ToneType[] = [
    { id: 'persuasive', label: 'Persuasive' },
    { id: 'casual', label: 'Casual' },
    { id: 'humorous', label: 'Humorous' },
    { id: 'formal', label: 'Formal' },
  ];

  @ViewChild('card', { static: true }) cardRef!: ElementRef<HTMLDivElement>;
  private renderer = inject(Renderer2);

  onSubmit(event: Event) {
    event.preventDefault();
    if (!this.topic().trim()) return;

    const payload = {
      topic: this.topic(),
      contentType: this.selectedContentType() as any,
      tone: this.selectedTone() as any,
      keywords: this.keywords(),
    };

    this.isGenerating.set(true);
    this.generatingChange.emit(true);
    this.outputChange.emit('');

    this.service.generateContent(payload).subscribe({
      next: (response) => {
        this.outputChange.emit(response.generatedContent);
        this.isGenerating.set(false);
        this.generatingChange.emit(false);
      },
      error: (error) => {
        console.error('Error generating content:', error);
        this.outputChange.emit('Error generating content. Please try again.');
        this.isGenerating.set(false);
        this.generatingChange.emit(false);
      },
    });
  }

  onCardMove(event: MouseEvent) {
    const el = this.cardRef?.nativeElement;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const dx = (x - cx) / cx; // -1 .. 1
    const dy = (y - cy) / cy; // -1 .. 1
    const tiltX = (dy * 6).toFixed(2);
    const tiltY = (dx * -6).toFixed(2);
    const transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(0)`;
    this.renderer.setStyle(el, 'transform', transform);
    this.renderer.setStyle(el, 'transition', 'transform 120ms cubic-bezier(.22,.9,.32,1)');
  }

  onCardLeave() {
    const el = this.cardRef?.nativeElement;
    if (!el) return;
    this.renderer.setStyle(el, 'transform', 'none');
    this.renderer.setStyle(el, 'transition', 'transform 450ms cubic-bezier(.22,.9,.32,1)');
  }
}
