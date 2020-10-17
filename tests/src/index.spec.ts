import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { YamlSource } from '../../src/index';

const expect = chai.expect;
chai.use(chaiAsPromised);

describe('yamlsource', () => {
  it('should expose library correctly', () => {
    expect(YamlSource, 'should be a function').to.be.a('function');
  });

  describe('reading invalid files', () => {
    it('should exception when a file does not exist', async () => {
      const fileName = `${__dirname}/test-files/yaml-source/no-such-file-01.yaml`;
      const yamlSource = new YamlSource(fileName);
      await expect(yamlSource.loadConfig()).to.be.rejectedWith(
        `ENOENT: no such file or directory, open '${fileName}'`,
      );
    });

    it('should exception when a file extension is not supported', async () => {
      const fileName = `${__dirname}/test-files/yaml-source/file.noext`;
      const yamlSource = new YamlSource(fileName);
      await expect(yamlSource.loadConfig()).to.be.rejectedWith(
        `File extension 'noext' not supported`,
      );
    });

    it('should exception when a file extension is not provided', async () => {
      const fileName = `${__dirname}/test-files/yaml-source/file`;
      const yamlSource = new YamlSource(fileName);
      await expect(yamlSource.loadConfig()).to.be.rejectedWith(
        `File '${fileName}' is not a valid or is missing a file extension`,
      );
    });

    it('should exception when an empty file name is provided', async () => {
      const yamlSource = new YamlSource('');
      await expect(yamlSource.loadConfig()).to.be.rejectedWith(
        `File '' is not a valid or is missing a file extension`,
      );
    });
  });

  describe('reading a .yaml file', () => {
    it('should read from a valid .yaml file', async () => {
      const sourceType = await new YamlSource(
        `${__dirname}/test-files/yaml-source/valid-01.yaml`,
      ).loadConfig();
      expect(sourceType.description, 'should have correct description').to.contain(
        'tests/src/test-files/yaml-source/valid-01.yaml',
      );
      expect(sourceType.data, 'should have correct data loaded from file').to.deep.equal({
        test: 'valid-01.yaml',
      });
    });

    it('should exception when reading from an invalid .yaml file', async () => {
      const fileName = `${__dirname}/test-files/yaml-source/invalid-01.yaml`;
      const yamlSource = new YamlSource(fileName);
      await expect(yamlSource.loadConfig()).to.be.rejectedWith(
        `${fileName}: incomplete explicit mapping pair; a key node is missed; or followed by a non-tabulated empty line at line 1, column 1:`,
      );
    });

    it('should read from an empty .yaml file creating an empty source.', async () => {
      const fileName = `${__dirname}/test-files/yaml-source/empty-01.yaml`;
      const yamlSource = new YamlSource(fileName);
      const sourceType = await yamlSource.loadConfig();
      expect(sourceType.data, 'should be empty').to.deep.equal({});
    });
  });

  describe('reading into a different root', () => {
    it(`should use the root provided in rootOffset as
        opposed to using default root`, async () => {
      const sourceType = await new YamlSource(
        `${__dirname}/test-files/yaml-source/valid-01.yaml`,
        'new.location',
      ).loadConfig();
      expect(sourceType.data, 'should have correct data loaded from file').to.deep.equal({
        new: { location: { test: 'valid-01.yaml' } },
      });
    });

    it(`should not care if the rootOffset is empty string ('')`, async () => {
      const sourceType = await new YamlSource(
        `${__dirname}/test-files/yaml-source/valid-01.yaml`,
        '',
      ).loadConfig();
      expect(sourceType.data, 'should have correct data loaded from file').to.deep.equal({
        test: 'valid-01.yaml',
      });
    });
  });
});
