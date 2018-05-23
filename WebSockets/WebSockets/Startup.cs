using System;
using System.Net.WebSockets;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace WebSockets
{
    public class Startup
    {
        // This method gets called by the runtime. Use this method to add services to the container.
        // For more information on how to configure your application, visit http://go.microsoft.com/fwlink/?LinkID=398940
        public void ConfigureServices(IServiceCollection services)
        {
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            loggerFactory.AddConsole(LogLevel.Debug);
            loggerFactory.AddDebug(LogLevel.Debug);

            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }


            var webSocketOptions = new WebSocketOptions()
            {
                KeepAliveInterval = TimeSpan.FromSeconds(120),
                ReceiveBufferSize = 4 * 1024
            };
            app.UseWebSockets(webSocketOptions);


            app.Use(async (context, next) =>
            {
                if (context.Request.Path == "/ws")
                {
                    if (context.WebSockets.IsWebSocketRequest)
                    {
                        var webSocket = await context.WebSockets.AcceptWebSocketAsync();
                        await SendActivities(webSocket);
                    }
                    else
                    {
                        context.Response.StatusCode = 400;
                    }
                }
                else
                {
                    await next();
                }

            });

            app.UseFileServer();
        }

        private async Task SendActivities(WebSocket webSocket)
        {
            var messages = new[]
            {
                "10:11: Phone boot",
                "10:35: Moved 32 meters SSW",
                "10:39: Moved 342 m N",
                "10:49: Moved 412 m NNW",
                "11:01: Stopped at new location: Antwerp: Lucky Strike Bar",
                "11:25: Credit card transaction: Eur. 11,10",
                "11:27: Moved 1.2 km S",
                "11:35: Moved 302 m S",
                "11:38: Moved 302 m S",
                "11:43: Stopped at new location: Antwerp: Nathan's liquor",
                "11:25: Credit card transaction: Eur. 9,35",
                "11:55: Moved 365 m N",
                "11:59: Moved 542 m SSW",
                "12:02: Stopped at new location: Antwerp: Kinepolis"
            };


            var random = new Random();
            foreach (var message in messages)
            {
                var jsonMessage = $"\"{message}\"";
                await webSocket.SendAsync(buffer: new ArraySegment<byte>(array: Encoding.ASCII.GetBytes(jsonMessage),
                        offset: 0,
                        count: jsonMessage.Length),
                    messageType: WebSocketMessageType.Text,
                    endOfMessage: true,
                    cancellationToken: CancellationToken.None);
                Thread.Sleep(random.Next(500, 4000));
            }

            await webSocket.CloseAsync(WebSocketCloseStatus.NormalClosure, "Done", CancellationToken.None);
        }
    }
}