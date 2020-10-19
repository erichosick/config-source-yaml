import fs from 'fs';
import yaml from 'js-yaml';

import { IConfigSource, ISourceType } from '@ehosick/config-core-types';

/**
 * YamlSource supports loading configuration and settings from a file.
 * Supported file types are: .json, .ts.
 * NOTE: .yml and others will be moved to their own libraries.
 */
export default class YamlSource implements IConfigSource {
  #fileAbsolutePath: string;

  #rootOffset: string;

  /**
   * Creates in instance of a YamlSource.
   * @param fileAbsolutePath Absolute path to file which contains configuration.
   * @param rootOffset (Optional) Wraps configured json in the context of
   * properties here. A value of 'level-01.level02' would result in data
   * being placed in `{ level-01: {level-02: data}}`.
   */
  constructor(fileAbsolutePath: string, rootOffset: string = '') {
    this.#fileAbsolutePath = fileAbsolutePath;
    this.#rootOffset = rootOffset;
  }

  /**
   * Returns file extension from an absolute path to the file.
   * @param fileAbsolutePath Absolute path to file.
   *
   * @throws An error if file extension is not provided or file name is invalid.
   */
  private static fileExtension(fileAbsolutePath: string): string {
    const fnSplit = fileAbsolutePath.split('.');
    if (fnSplit.length <= 1) {
      throw new Error(`File '${fileAbsolutePath}' is not a valid or is missing a file extension`);
    }
    return fnSplit[fnSplit.length - 1].toLowerCase();
  }

  /**
   * Asynchronously loads the file configuration and converts it to json as needed.
   *
   * @Returns Return, upon promise resolution (await), an ISourceType containing
   * the configuration data.
   *
   */
  public async loadConfig(): Promise<ISourceType> {
    return new Promise<ISourceType>((resolve, reject) => {
      let fileExtension;
      try {
        fileExtension = YamlSource.fileExtension(this.#fileAbsolutePath);
      } catch (exception) {
        reject(exception);
      }
      const description = `file: ${this.#fileAbsolutePath}`;
      let data;

      switch (fileExtension) {
        case 'yaml': {
          const bufferData = fs.readFileSync(this.#fileAbsolutePath, 'utf8');
          if (bufferData.length === 0) {
            data = {};
          } else {
            try {
              data = yaml.safeLoad(bufferData, { json: true });
            } catch (err) {
              reject(Error(`${this.#fileAbsolutePath}: ${err.message}`));
            }
          }
          break;
        }
        default:
          reject(Error(`File extension '${fileExtension}' not supported`));
      }

      if (this.#rootOffset !== '') {
        const newData = {};
        let curData = newData;
        const properties = this.#rootOffset.split('.');
        properties.forEach((propName, index) => {
          curData[propName] = properties.length === index + 1 ? data : {};
          curData = curData[propName];
        });
        data = newData;
      }

      resolve({
        description,
        data,
      });
    });
  }
}
