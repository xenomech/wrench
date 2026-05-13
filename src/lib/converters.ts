import yaml from 'js-yaml';
import * as TOML from 'smol-toml';

export type Format = 'json' | 'yaml' | 'toml';

export type ConversionResult = {
  success: true;
  output: string;
} | {
  success: false;
  error: string;
  line?: number;
  column?: number;
};

function parseInput(input: string, format: Format): ConversionResult & { data?: unknown } {
  try {
    let data: unknown;
    switch (format) {
      case 'json':
        data = JSON.parse(input);
        break;
      case 'yaml':
        data = yaml.load(input);
        break;
      case 'toml':
        data = TOML.parse(input);
        break;
    }
    return { success: true, output: '', data };
  } catch (e: any) {
    const errorInfo = extractErrorPosition(e, format);
    return {
      success: false,
      error: e.message || 'Parse error',
      ...errorInfo,
    };
  }
}

function extractErrorPosition(e: any, format: Format): { line?: number; column?: number } {
  if (format === 'json') {
    const match = e.message?.match(/position (\d+)/);
    if (match) return {};
  }
  if (format === 'yaml' && e.mark) {
    return { line: e.mark.line + 1, column: e.mark.column + 1 };
  }
  if (format === 'toml' && e.line) {
    return { line: e.line, column: e.column };
  }
  return {};
}

function stringify(data: unknown, format: Format, indent: number = 2): string {
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, indent);
    case 'yaml':
      return yaml.dump(data, { indent, lineWidth: -1, noRefs: true });
    case 'toml':
      return TOML.stringify(data as Record<string, unknown>);
  }
}

export function convert(input: string, from: Format, to: Format, indent: number = 2): ConversionResult {
  if (!input.trim()) {
    return { success: false, error: 'Input is empty' };
  }

  const parsed = parseInput(input, from);
  if (!parsed.success) return parsed;

  try {
    const output = stringify(parsed.data, to, indent);
    return { success: true, output };
  } catch (e: any) {
    return {
      success: false,
      error: `Cannot convert to ${to.toUpperCase()}: ${e.message}`,
    };
  }
}

export function format(input: string, fmt: Format, indent: number = 2): ConversionResult {
  return convert(input, fmt, fmt, indent);
}

export function validate(input: string, fmt: Format): ConversionResult {
  if (!input.trim()) {
    return { success: false, error: 'Input is empty' };
  }

  const parsed = parseInput(input, fmt);
  if (!parsed.success) return parsed;

  return { success: true, output: 'Valid ' + fmt.toUpperCase() };
}

export function detectFormat(input: string): Format | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      JSON.parse(trimmed);
      return 'json';
    } catch {}
  }

  try {
    TOML.parse(trimmed);
    if (trimmed.includes('=') || trimmed.includes('[')) {
      return 'toml';
    }
  } catch {}

  try {
    const result = yaml.load(trimmed);
    if (typeof result === 'object' && result !== null) {
      return 'yaml';
    }
  } catch {}

  return null;
}
