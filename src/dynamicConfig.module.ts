import { DynamicModule, Module } from "@nestjs/common";

export interface Config {
  apiKey: string;
}
@Module({
  providers: [
    {
      provide: "PREFIX",
      useValue: "prefix",
    },
  ],
  exports: ["PREFIX"],
})
export class DynamicConfigModule {
  static forRoot(msg: string): DynamicModule | Promise<DynamicModule> {
    const providers = [
      {
        provide: "CONFIG",
        useValue: { apiKey: msg },
      },
    ];
    const res = {
      module: DynamicConfigModule,
      providers,
      exports: providers.map((provider) => {
        return provider instanceof Function ? provider : provider.provide;
      }),
    };
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(res);
      }, 3000);
    });
  }
}
