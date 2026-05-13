export const sampleJson = `{
  "name": "dev-tools",
  "version": "1.0.0",
  "description": "A collection of developer tools",
  "author": {
    "name": "Gokul Suresh",
    "url": "https://justgokul.dev"
  },
  "features": ["formatter", "converter", "validator"],
  "settings": {
    "theme": "light",
    "indentSize": 2,
    "autoFormat": true
  }
}`;

export const sampleYaml = `name: dev-tools
version: 1.0.0
description: A collection of developer tools
author:
  name: Gokul Suresh
  url: https://justgokul.dev
features:
  - formatter
  - converter
  - validator
settings:
  theme: light
  indentSize: 2
  autoFormat: true
`;

export const sampleToml = `name = "dev-tools"
version = "1.0.0"
description = "A collection of developer tools"
features = ["formatter", "converter", "validator"]

[author]
name = "Gokul Suresh"
url = "https://justgokul.dev"

[settings]
theme = "light"
indentSize = 2
autoFormat = true
`;

export const samples: Record<string, string> = {
  json: sampleJson,
  yaml: sampleYaml,
  toml: sampleToml,
};
