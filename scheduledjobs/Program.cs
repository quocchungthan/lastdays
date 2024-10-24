using DataLayer.EFCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using System;

var host = Host.CreateDefaultBuilder(args)
		.ConfigureAppConfiguration((context, config) =>
		{
			config.SetBasePath(AppContext.BaseDirectory)
					.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true);
		})
	 .ConfigureServices((context, services) =>
	 {
		 // Configure DbContext with SQL Server
		 services.AddDbContext<AppDbContext>(options =>
			  options.UseNpgsql("YourConnectionStringHere"));

		 // Register other services as needed
	 })
	 .Build();