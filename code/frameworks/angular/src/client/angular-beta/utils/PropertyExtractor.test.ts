import { CommonModule } from '@angular/common';
import { Component, Directive, Injectable, InjectionToken, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {
  BrowserAnimationsModule,
  NoopAnimationsModule,
  provideAnimations,
  provideNoopAnimations,
} from '@angular/platform-browser/animations';
import { NgModuleMetadata } from '../../types';
import { PropertyExtractor, REMOVED_MODULES } from './PropertyExtractor';
import { WithOfficialModule } from '../__testfixtures__/test.module';

const TEST_TOKEN = new InjectionToken('testToken');
const TestTokenProvider = { provide: TEST_TOKEN, useValue: 123 };
const TestService = Injectable()(class {});
const TestComponent1 = Component({})(class {});
const TestComponent2 = Component({})(class {});
const StandaloneTestComponent = Component({ standalone: true })(class {});
const TestDirective = Directive({})(class {});
const TestModuleWithDeclarations = NgModule({ declarations: [TestComponent1] })(class {});
const TestModuleWithImportsAndProviders = NgModule({
  imports: [TestModuleWithDeclarations],
  providers: [TestTokenProvider],
})(class {});

const analyzeMetadata = (metadata: NgModuleMetadata, component?: any) => {
  return new PropertyExtractor(metadata, component);
};
const extractImports = (metadata: NgModuleMetadata, component?: any) => {
  const { imports } = new PropertyExtractor(metadata, component);
  return imports;
};
const extractDeclarations = (metadata: NgModuleMetadata, component?: any) => {
  const { declarations } = new PropertyExtractor(metadata, component);
  return declarations;
};
const extractProviders = (metadata: NgModuleMetadata, component?: any) => {
  const { providers } = new PropertyExtractor(metadata, component);
  return providers;
};
const extractSingletons = (metadata: NgModuleMetadata, component?: any) => {
  const { singletons } = new PropertyExtractor(metadata, component);
  return singletons;
};

describe('PropertyExtractor', () => {
  describe('analyzeMetadata', () => {
    it('should remove BrowserModule', () => {
      const metadata = {
        imports: [BrowserModule],
      };
      const { imports, providers, singletons } = analyzeMetadata(metadata);
      expect(imports.flat(Number.MAX_VALUE)).toEqual([CommonModule]);
      expect(providers.flat(Number.MAX_VALUE)).toEqual([]);
      expect(singletons.flat(Number.MAX_VALUE)).toEqual([]);
    });

    it('should remove BrowserAnimationsModule and use its providers instead', () => {
      const metadata = {
        imports: [BrowserAnimationsModule],
      };
      const { imports, providers, singletons } = analyzeMetadata(metadata);
      expect(imports.flat(Number.MAX_VALUE)).toEqual([CommonModule]);
      expect(providers.flat(Number.MAX_VALUE)).toEqual([]);
      expect(singletons.flat(Number.MAX_VALUE)).toEqual(provideAnimations());
    });

    it('should remove NoopAnimationsModule and use its providers instead', () => {
      const metadata = {
        imports: [NoopAnimationsModule],
      };
      const { imports, providers, singletons } = analyzeMetadata(metadata);
      expect(imports.flat(Number.MAX_VALUE)).toEqual([CommonModule]);
      expect(providers.flat(Number.MAX_VALUE)).toEqual([]);
      expect(singletons.flat(Number.MAX_VALUE)).toEqual(provideNoopAnimations());
    });

    it('should remove Browser/Animations modules recursively', () => {
      const metadata = {
        imports: [BrowserAnimationsModule, BrowserModule],
      };
      const { imports, providers, singletons } = analyzeMetadata(metadata);
      expect(imports.flat(Number.MAX_VALUE)).toEqual([CommonModule]);
      expect(providers.flat(Number.MAX_VALUE)).toEqual([]);
      expect(singletons.flat(Number.MAX_VALUE)).toEqual(provideAnimations());
    });

    it('should not destructure Angular official module', () => {
      const metadata = {
        imports: [WithOfficialModule],
      };
      const { imports, providers, singletons } = analyzeMetadata(metadata);
      expect(imports.flat(Number.MAX_VALUE)).toEqual([CommonModule, WithOfficialModule]);
      expect(providers.flat(Number.MAX_VALUE)).toEqual([]);
      expect(singletons.flat(Number.MAX_VALUE)).toEqual([]);
    });
  });

  describe('extractImports', () => {
    it('should return Angular official modules', () => {
      const imports = extractImports({ imports: [TestModuleWithImportsAndProviders] });
      expect(imports).toEqual([CommonModule, TestModuleWithImportsAndProviders]);
    });

    it('should return standalone components', () => {
      const imports = extractImports(
        {
          imports: [TestModuleWithImportsAndProviders],
        },
        StandaloneTestComponent
      );
      expect(imports).toEqual([
        CommonModule,
        TestModuleWithImportsAndProviders,
        StandaloneTestComponent,
      ]);
    });
  });

  describe('extractDeclarations', () => {
    it('should return an array of declarations that contains `storyComponent`', () => {
      const declarations = extractDeclarations({ declarations: [TestComponent1] }, TestComponent2);
      expect(declarations).toEqual([TestComponent1, TestComponent2]);
    });
  });

  describe('extractProviders', () => {
    it('should return an array of providers', () => {
      const providers = extractProviders({
        providers: [TestService],
      });
      expect(providers).toEqual([TestService]);
    });

    it('should return an array of singletons extracted', () => {
      const singeltons = extractSingletons({
        imports: [BrowserAnimationsModule],
      });

      expect(singeltons).toEqual(provideAnimations());
    });
  });
});
