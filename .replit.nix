{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.typescript-language-server
    pkgs.yarn
    pkgs.replitPackages.jest
  ];
  
  # Bootup script that runs when the environment starts
  onBoot = ''
    # Make startup.sh executable
    chmod +x startup.sh
    
    # Start the never-sleep system if it's not already running
    if [ ! -f .never-sleep.pid ] || ! ps -p $(cat .never-sleep.pid 2>/dev/null) > /dev/null; then
      mkdir -p logs
      nohup ./startup.sh > logs/bootup.log 2>&1 &
    fi
  '';
}