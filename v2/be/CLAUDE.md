# CLAUDE.md — BetterAttendance Backend

## Stack
.NET 10 · Native AOT · Clean Architecture · Mediator v3 (source-gen) · EF Core 10 (compiled models) · Mapperly · FluentValidation · PostgreSQL · Minimal APIs · AWS Lambda dual-boot

## Hard rules
- NEVER use MediatR — use Mediator v3 (package: Mediator.SourceGenerator)
- NEVER use AutoMapper — use Mapperly ([Mapper] attribute, source-gen)
- NEVER use Newtonsoft.Json — use System.Text.Json only
- NEVER use reflection (GetType, GetProperties, Activator.CreateInstance)
- ALL serialized types must be in AppJsonContext ([JsonSerializable])
- ALL DbContext changes require running: dotnet ef dbcontext optimize
- Use record for DTOs/Commands/Queries, sealed for concrete classes
- Primary constructors for dependency injection
- File-scoped namespaces everywhere
- Nullable enable on all projects
- CancellationToken on every async method
- Result<T> pattern — no exceptions for business logic

## Reference chain
Api → Application → Domain
Infrastructure → Application
