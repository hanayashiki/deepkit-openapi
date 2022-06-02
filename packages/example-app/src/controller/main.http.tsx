import {
  http,
  HttpQueries,
  HttpQuery,
  HttpResponse,
  UploadedFile,
} from "@deepkit/http";
import { LoggerInterface } from "@deepkit/logger";
import { OpenAPIService } from "deepkit-openapi";
import { stringify } from "yaml";
import { SQLiteDatabase, User } from "../database";

class AddUserDto extends User {
  imageUpload?: UploadedFile;
}

@http.controller()
export class MainController {
  constructor(
    protected logger: LoggerInterface,
    protected database: SQLiteDatabase,
    protected openApi: OpenAPIService,
  ) {}

  @http.GET("/openapi")
  async getOpenApi() {
    return this.openApi.serialize();
  }

  @http.GET("/openapi.yaml")
  getOpenApiYaml(response: HttpResponse): string {
    const s = stringify(this.openApi.serialize());
    response.setHeader("content-type", "text/yaml");
    response.end(s);

    return s;
  }

  // @http.GET("/").name("startPage").description("List all users")
  // async startPage() {
  //   return <UserList />;
  // }

  // @http.GET("/api/users")
  // async users(): Promise<User[]> {
  //   return await this.database.query(User).find();
  // }

  @http.GET("/api/user/:id")
  async user(id: number): Promise<User> {
    return await this.database.query(User).filter({ id }).findOne();
  }

  @http.GET("/api/user/sync/:id")
  userSync(id: number): User {
    return new User("alice");
  }

  // @http.DELETE("/api/user/:id")
  // async deleteUser(id: number) {
  //   const res = await this.database.query(User).filter({ id }).deleteOne();
  //   return res.modified === 1;
  // }

  // @http.GET("/benchmark")
  // benchmark() {
  //   return "hi";
  // }

  // @http.GET("/image/:id")
  // async userImage(id: number, response: HttpResponse) {
  //   const user = await this.database.query(User).filter({ id }).findOne();
  //   if (!user.image) {
  //     return new HtmlResponse("Not found", 404);
  //   }
  //   return response.end(user.image);
  // }

  // @http.POST("/add").description("Adds a new user")
  // async add(body: HttpBodyValidation<AddUserDto>) {
  //   if (!body.valid())
  //     return <UserList error={body.error.getErrorMessageForPath("username")} />;

  //   const user = new User(body.value.username);
  //   if (body.value.imageUpload) {
  //     //alternatively, move the file to `var/` and store its path into `user.image` (change it to a string)
  //     user.image = await readFile(body.value.imageUpload.path);
  //   }
  //   this.logger.log("New user!", user);
  //   await this.database.persist(user);

  //   return Redirect.toRoute("startPage");
  // }

  // @http.GET("/path/:name")
  // async urlParam(name: string) {
  //   return name;
  // }

  @http.GET("/query")
  async queryParam(
    shit: HttpQuery<string>,
    peter: HttpQuery<string> = "peter",
  ) {
    return peter;
  }

  @http.GET("/omit")
  async omit(shit?: HttpQuery<number>) {
    return shit;
  }

  @http.GET("/queryWithQueries")
  async queryWithQueries(
    shit: HttpQuery<number>,
    queries: HttpQueries<{ limit: number; offset: number }>,
  ) {
    return shit;
  }

  @http.GET("/twoQueries")
  async twoQueries(
    q1: HttpQueries<{ a: number; b: string }>,
    q2: HttpQueries<{ a: string }>,
  ) {
    return typeof q1.a;
  }

  // @http.GET("/queriesWithString")
  // async queriesWithString(queries: HttpQueries<string>) {
  //   return;
  // }
}
