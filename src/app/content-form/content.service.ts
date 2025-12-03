import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';
import { GoogleGenAI } from '@google/genai';
import { environment } from '../environments/environment';

// Defines the structure (shape of data) of the content generation request
interface ContentRequest {
  topic: string;
  contentType: 'blog_post' | 'social_media_update' | 'email_draft' | 'product_description';
  tone?: 'formal' | 'casual' | 'humorous' | 'persuasive';
  keywords?: string;
}

interface ContentResponse {
  generatedContent: string;
  promptUsed: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContentService {
  // Initialize the Google GenAI client only when an API key is provided.
  // If no key is present we run in "mock mode" so the app can function
  // for UI/development without contacting the real API or requiring billing.
  private ai?: GoogleGenAI;

  constructor() {
    if (environment.GEMINI_API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: environment.GEMINI_API_KEY });
    } else {
      console.warn('GEMINI_API_KEY not set — ContentService running in mock mode.');
    }
  }

  generateContent(payload: ContentRequest): Observable<ContentResponse> {
    return from(this.generateContentAsync(payload));
  }

  private async generateContentAsync(input: ContentRequest): Promise<ContentResponse> {
    const { topic, contentType, tone = 'casual', keywords } = input;
    let prompt = `Generate a ${contentType} about "${topic}".`;
    if (tone) {
      prompt += ` The tone should be ${tone}.`;
    }
    if (keywords) {
      prompt += ` Please incorporate the following keywords: ${keywords}.`;
    }

    switch (contentType) {
      case 'blog_post':
        prompt += ` The blog post should be engaging, well-structured with a clear introduction, body, and conclusion. Aim for around 500-800 words.`;
        break;
      case 'social_media_update':
        prompt += ` Keep it concise and engaging for social media. Include relevant hashtags if possible. Max 280 characters.`;
        break;
      case 'email_draft':
        prompt += ` Draft a professional email. Include a subject line, greeting, body, and closing.`;
        break;
      case 'product_description':
        prompt += ` Write a compelling product description highlighting key features and benefits.`;
        break;
    }

    console.log('Using prompt:', prompt);

    // If the GenAI client wasn't initialized (no API key), return a mock
    // response so the UI can be developed and tested without billing.
    if (!this.ai) {
      const mockContent = this.buildMockContent({ topic, contentType, tone, keywords });
      return {
        generatedContent: mockContent,
        promptUsed: prompt,
      };
    }

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      },
    });

    const generatedContent = response.text || '';

    return {
      generatedContent,
      promptUsed: prompt,
    };
  }

  // Helper used only for mock/dev mode to generate a plausible piece of text
  // without calling the external API.
  private buildMockContent(input: ContentRequest): string {
    const { topic, contentType, tone = 'casual', keywords } = input;
    let base = '';
    switch (contentType) {
      case 'blog_post':
        base = `Mock blog post about "${topic}". This is an example introduction followed by a body and a conclusion. Tone: ${tone}.`;
        break;
      case 'social_media_update':
        base = `Mock social update: ${topic} — concise and engaging. Tone: ${tone}.`;
        break;
      case 'email_draft':
        base = `Subject: Mock email about ${topic}\n\nHello,\n\nThis is a mock email body written in a ${tone} tone.\n\nRegards,\nTeam`;
        break;
      case 'product_description':
        base = `Mock product description for ${topic}. Highlights: features and benefits in a ${tone} tone.`;
        break;
      default:
        base = `Mock content for ${topic} (type: ${contentType}). Tone: ${tone}.`;
    }

    if (keywords) {
      base += `\n\nKeywords: ${keywords}`;
    }

    return base;
  }
}
