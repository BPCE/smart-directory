

def check_args(args, args_required):
    for arg in args_required:
        if args.get(arg) == None:
            raise ValueError("missing argument %s" % arg)

